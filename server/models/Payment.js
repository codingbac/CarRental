import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema({
    transactionUuid: { type: String, required: true, unique: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    car: { type: mongoose.Schema.Types.ObjectId, ref: "Car", required: true },
    pickupDate: { type: Date, required: true },
    returnDate: { type: Date, required: true },
    amount: { type: Number, required: true },
    status: { type: String, enum: ["PENDING", "COMPLETE", "FAILED"], default: "PENDING" },
    transactionCode: { type: String, default: "" }
}, { timestamps: true });

const Payment = mongoose.model("Payment", paymentSchema);

export default Payment;
