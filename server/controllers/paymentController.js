import crypto from "crypto";
import Car from "../models/Car.js";
import Booking from "../models/Booking.js";
import Payment from "../models/Payment.js";

const getBaseUrl = () => (process.env.SERVER_URL || "http://localhost:3000").replace(/\/$/, "");
const getClientUrl = () => (process.env.CLIENT_URL || "http://localhost:5173").replace(/\/$/, "");

const createSignature = (message) => {
    return crypto.createHmac("sha256", process.env.ESEWA_SECRET_KEY).update(message).digest("base64");
};

const isSameSignature = (a, b) => {
    if (!a || !b) return false;
    const first = Buffer.from(a);
    const second = Buffer.from(b);
    return first.length === second.length && crypto.timingSafeEqual(first, second);
};

const checkAvailability = async (car, pickupDate, returnDate) => {
    const bookings = await Booking.find({
        car,
        pickupDate: { $lte: returnDate },
        returnDate: { $gte: pickupDate },
    });
    return bookings.length === 0;
};

export const initiateEsewaPayment = async (req, res) => {
    try {
        const { _id } = req.user;
        const { car: carId, pickupDate, returnDate } = req.body;
        const car = await Car.findById(carId);

        if (!car || !car.isAvaliable) return res.json({ success: false, message: "Car is not available" });
        if (!pickupDate || !returnDate) return res.json({ success: false, message: "Pickup and return dates are required" });

        const picked = new Date(pickupDate);
        const returned = new Date(returnDate);
        const noOfDays = Math.ceil((returned - picked) / (1000 * 60 * 60 * 24));
        if (noOfDays <= 0) return res.json({ success: false, message: "Return date must be after pickup date" });

        if (!await checkAvailability(carId, pickupDate, returnDate)) {
            return res.json({ success: false, message: "Car is not available for these dates" });
        }

        const amount = car.pricePerDay * noOfDays;
        const transactionUuid = `CAR-${Date.now()}-${crypto.randomBytes(4).toString("hex")}`;
        const productCode = process.env.ESEWA_PRODUCT_CODE || "EPAYTEST";
        const signedFieldNames = "total_amount,transaction_uuid,product_code";
        const signature = createSignature(`total_amount=${amount},transaction_uuid=${transactionUuid},product_code=${productCode}`);

        await Payment.create({ transactionUuid, user: _id, car: carId, pickupDate, returnDate, amount, status: "PENDING" });

        res.json({
            success: true,
            paymentUrl: process.env.ESEWA_PAYMENT_URL || "https://rc-epay.esewa.com.np/api/epay/main/v2/form",
            fields: {
                amount: String(amount),
                tax_amount: "0",
                product_service_charge: "0",
                product_delivery_charge: "0",
                total_amount: String(amount),
                transaction_uuid: transactionUuid,
                product_code: productCode,
                success_url: `${getBaseUrl()}/api/payments/esewa/success`,
                failure_url: `${getBaseUrl()}/api/payments/esewa/failure`,
                signed_field_names: signedFieldNames,
                signature
            }
        });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ success: false, message: "Unable to start eSewa payment" });
    }
};

export const esewaSuccess = async (req, res) => {
    try {
        if (!req.query.data) return res.redirect(`${getClientUrl()}/my-bookings?payment=failed`);

        const decoded = JSON.parse(Buffer.from(req.query.data, "base64").toString("utf8"));
        const signedFields = decoded.signed_field_names?.split(",") || [];
        const signatureMessage = signedFields.map(field => `${field}=${decoded[field]}`).join(",");
        const expectedSignature = createSignature(signatureMessage);

        if (!isSameSignature(decoded.signature, expectedSignature)) {
            return res.redirect(`${getClientUrl()}/my-bookings?payment=failed`);
        }

        const payment = await Payment.findOne({ transactionUuid: decoded.transaction_uuid });
        if (!payment || String(payment.amount) !== String(decoded.total_amount)) {
            return res.redirect(`${getClientUrl()}/my-bookings?payment=failed`);
        }

        // A successful callback may be retried by the gateway. Do not create a second booking.
        if (payment.status === "COMPLETE") {
            return res.redirect(`${getClientUrl()}/my-bookings?payment=success`);
        }

        const productCode = process.env.ESEWA_PRODUCT_CODE || "EPAYTEST";
        const statusUrl = `${process.env.ESEWA_STATUS_URL || "https://rc-epay.esewa.com.np/api/epay/transaction/status/"}?product_code=${encodeURIComponent(productCode)}&total_amount=${encodeURIComponent(payment.amount)}&transaction_uuid=${encodeURIComponent(payment.transactionUuid)}`;
        const statusResponse = await fetch(statusUrl);
        const statusData = await statusResponse.json();

        if (!statusResponse.ok || statusData.status !== "COMPLETE") {
            payment.status = "FAILED";
            await payment.save();
            return res.redirect(`${getClientUrl()}/my-bookings?payment=failed`);
        }

        const car = await Car.findById(payment.car);
        if (!car) return res.redirect(`${getClientUrl()}/my-bookings?payment=failed`);

        payment.status = "COMPLETE";
        payment.transactionCode = decoded.transaction_code || "";
        await payment.save();

        await Booking.create({
            car: payment.car,
            owner: car.owner,
            user: payment.user,
            pickupDate: payment.pickupDate,
            returnDate: payment.returnDate,
            price: payment.amount,
            status: "pending"
        });

        res.redirect(`${getClientUrl()}/my-bookings?payment=success`);
    } catch (error) {
        console.error(error.message);
        res.redirect(`${getClientUrl()}/my-bookings?payment=failed`);
    }
};

export const esewaFailure = async (req, res) => {
    try {
        const transactionUuid = req.query.transaction_uuid;
        if (transactionUuid) await Payment.findOneAndUpdate({ transactionUuid }, { status: "FAILED" });
    } catch (error) {
        console.error(error.message);
    }
    res.redirect(`${getClientUrl()}/my-bookings?payment=failed`);
};
