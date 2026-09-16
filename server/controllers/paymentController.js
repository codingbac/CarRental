import crypto from "crypto";
import Booking from "../models/Booking.js";
import Car from "../models/Car.js";
import Payment from "../models/Payment.js";

const productCode = process.env.ESEWA_PRODUCT_CODE || "EPAYTEST";
const paymentUrl = process.env.ESEWA_PAYMENT_URL || "https://rc-epay.esewa.com.np/api/epay/main/v2/form";
const statusUrl = process.env.ESEWA_STATUS_URL || "https://rc.esewa.com.np/api/epay/transaction/status/";

const sign = (message) => crypto
    .createHmac("sha256", process.env.ESEWA_SECRET_KEY)
    .update(message)
    .digest("base64");

const checkAvailability = async (car, pickupDate, returnDate) => {
    const bookings = await Booking.find({
        car,
        pickupDate: { $lte: returnDate },
        returnDate: { $gte: pickupDate }
    });
    return bookings.length === 0;
};

export const initiateEsewaPayment = async (req, res) => {
    try {
        if (!process.env.ESEWA_SECRET_KEY) {
            return res.json({ success: false, message: "eSewa is not configured on the server" });
        }

        const { _id } = req.user;
        const { car, pickupDate, returnDate } = req.body;
        const carData = await Car.findById(car);

        if (!carData) return res.json({ success: false, message: "Car not found" });
        if (!carData.isAvaliable) return res.json({ success: false, message: "Car is not available" });
        if (!pickupDate || !returnDate || new Date(returnDate) <= new Date(pickupDate)) {
            return res.json({ success: false, message: "Please select valid pickup and return dates" });
        }

        if (!(await checkAvailability(car, pickupDate, returnDate))) {
            return res.json({ success: false, message: "Car is not available for these dates" });
        }

        const days = Math.ceil((new Date(returnDate) - new Date(pickupDate)) / (1000 * 60 * 60 * 24));
        const amount = carData.pricePerDay * days;
        const transactionUuid = `CR-${Date.now()}-${crypto.randomBytes(4).toString("hex")}`;
        const signedFieldNames = "total_amount,transaction_uuid,product_code";
        const message = `total_amount=${amount},transaction_uuid=${transactionUuid},product_code=${productCode}`;
        const signature = sign(message);
        const serverUrl = process.env.SERVER_URL || `http://localhost:${process.env.PORT || 3000}`;

        await Payment.create({
            transactionUuid,
            user: _id,
            car,
            pickupDate,
            returnDate,
            amount,
            status: "PENDING"
        });

        res.json({
            success: true,
            paymentUrl,
            fields: {
                amount: String(amount),
                tax_amount: "0",
                product_service_charge: "0",
                product_delivery_charge: "0",
                total_amount: String(amount),
                transaction_uuid: transactionUuid,
                product_code: productCode,
                success_url: `${serverUrl}/api/payments/esewa/success`,
                failure_url: `${serverUrl}/api/payments/esewa/failure`,
                signed_field_names: signedFieldNames,
                signature
            }
        });
    } catch (error) {
        console.error("eSewa initiate error:", error);
        res.status(500).json({ success: false, message: "Unable to start eSewa payment" });
    }
};

export const esewaSuccess = async (req, res) => {
    try {
        const encodedData = req.query.data;
        if (!encodedData) return res.redirect(`${process.env.CLIENT_URL}/my-bookings?payment=failed`);

        const response = JSON.parse(Buffer.from(encodedData, "base64").toString("utf8"));
        const payment = await Payment.findOne({ transactionUuid: response.transaction_uuid });

        if (!payment) return res.redirect(`${process.env.CLIENT_URL}/my-bookings?payment=failed`);

        const signedNames = response.signed_field_names.split(",");
        const message = signedNames.map((name) => `${name}=${response[name]}`).join(",");
        const expectedSignature = sign(message);

        if (expectedSignature !== response.signature || response.product_code !== productCode) {
            payment.status = "FAILED";
            await payment.save();
            return res.redirect(`${process.env.CLIENT_URL}/my-bookings?payment=failed`);
        }

        const verifyUrl = new URL(statusUrl);
        verifyUrl.searchParams.set("product_code", productCode);
        verifyUrl.searchParams.set("total_amount", String(payment.amount));
        verifyUrl.searchParams.set("transaction_uuid", payment.transactionUuid);

        const verifyResponse = await fetch(verifyUrl);
        const verification = await verifyResponse.json();

        if (verification.status !== "COMPLETE") {
            payment.status = "FAILED";
            await payment.save();
            return res.redirect(`${process.env.CLIENT_URL}/my-bookings?payment=failed`);
        }

        payment.status = "COMPLETE";
        payment.transactionCode = response.transaction_code || verification.ref_id || null;
        await payment.save();

        const alreadyBooked = !(await checkAvailability(payment.car, payment.pickupDate, payment.returnDate));
        if (!alreadyBooked) {
            const carData = await Car.findById(payment.car);
            await Booking.create({
                car: payment.car,
                owner: carData.owner,
                user: payment.user,
                pickupDate: payment.pickupDate,
                returnDate: payment.returnDate,
                price: payment.amount,
                status: "pending"
            });
        }

        res.redirect(`${process.env.CLIENT_URL}/my-bookings?payment=success`);
    } catch (error) {
        console.error("eSewa success error:", error);
        res.redirect(`${process.env.CLIENT_URL}/my-bookings?payment=failed`);
    }
};

export const esewaFailure = async (req, res) => {
    try {
        const transactionUuid = req.query.transaction_uuid;
        if (transactionUuid) {
            await Payment.findOneAndUpdate({ transactionUuid }, { status: "FAILED" });
        }
    } catch (error) {
        console.error("eSewa failure error:", error);
    }
    res.redirect(`${process.env.CLIENT_URL}/my-bookings?payment=failed`);
};
