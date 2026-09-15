import ImageKit from "@imagekit/nodejs";
import Booking from "../models/Booking.js";
import Car from "../models/Car.js";
import User from "../models/User.js";
import fs from "fs";

// ImageKit Client
const imagekit = new ImageKit({
    privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
});


// API to Change Role of User
export const changeRoleToOwner = async (req, res) => {
    try {
        const { _id } = req.user;

        await User.findByIdAndUpdate(_id, {
            role: "owner"
        });

        res.json({
            success: true,
            message: "Now you can list cars"
        });

    } catch (error) {
        console.log(error.message);

        res.json({
            success: false,
            message: error.message
        });
    }
};


// API to List Car
export const addCar = async (req, res) => {
    try {
        const { _id } = req.user;

        const car = JSON.parse(req.body.carData);
        const imageFile = req.file;

        // Upload Image to ImageKit
        const response = await imagekit.files.upload({
            file: fs.createReadStream(imageFile.path),
            fileName: imageFile.originalname,
            folder: "/cars"
        });

        // Generate optimized ImageKit URL
        const optimizedImageUrl = imagekit.helper.buildSrc({
            urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
            src: response.filePath,
            transformation: [
                {
                    width: 1280,
                    quality: 80,
                    format: "webp"
                }
            ]
        });

        const image = optimizedImageUrl;

        // Save car in database
        await Car.create({
            ...car,
            owner: _id,
            image
        });

        res.json({
            success: true,
            message: "Car Added"
        });

    } catch (error) {
        console.log(error.message);

        res.json({
            success: false,
            message: error.message
        });
    }
};


// API to List Owner Cars
export const getOwnerCars = async (req, res) => {
    try {
        const { _id } = req.user;

        const cars = await Car.find({
            owner: _id
        });

        res.json({
            success: true,
            cars
        });

    } catch (error) {
        console.log(error.message);

        res.json({
            success: false,
            message: error.message
        });
    }
};


// API to Toggle Car Availability
export const toggleCarAvailability = async (req, res) => {
    try {
        const { _id } = req.user;
        const { carId } = req.body;

        const car = await Car.findById(carId);

        if (!car) {
            return res.json({
                success: false,
                message: "Car not found"
            });
        }

        // Check if car belongs to the user
        if (car.owner.toString() !== _id.toString()) {
            return res.json({
                success: false,
                message: "Unauthorized"
            });
        }

        car.isAvaliable = !car.isAvaliable;

        await car.save();

        res.json({
            success: true,
            message: "Availability Toggled"
        });

    } catch (error) {
        console.log(error.message);

        res.json({
            success: false,
            message: error.message
        });
    }
};


// API to Delete a Car
export const deleteCar = async (req, res) => {
    try {
        const { _id } = req.user;
        const { carId } = req.body;

        const car = await Car.findById(carId);

        if (!car) {
            return res.json({
                success: false,
                message: "Car not found"
            });
        }

        // Check if car belongs to the user
        if (car.owner.toString() !== _id.toString()) {
            return res.json({
                success: false,
                message: "Unauthorized"
            });
        }

        car.owner = null;
        car.isAvaliable = false;

        await car.save();

        res.json({
            success: true,
            message: "Car Removed"
        });

    } catch (error) {
        console.log(error.message);

        res.json({
            success: false,
            message: error.message
        });
    }
};


// API to Get Dashboard Data
export const getDashboardData = async (req, res) => {
    try {
        const { _id, role } = req.user;

        if (role !== "owner") {
            return res.json({
                success: false,
                message: "Unauthorized"
            });
        }

        const cars = await Car.find({
            owner: _id
        });

        const bookings = await Booking.find({
            owner: _id
        })
            .populate("car")
            .sort({ createdAt: -1 });

        const pendingBookings = await Booking.find({
            owner: _id,
            status: "pending"
        });

        const completedBookings = await Booking.find({
            owner: _id,
            status: "confirmed"
        });

        // Calculate monthly revenue
        const monthlyRevenue = bookings
            .filter(booking => booking.status === "confirmed")
            .reduce(
                (acc, booking) => acc + booking.price,
                0
            );

        const dashboardData = {
            totalCars: cars.length,
            totalBookings: bookings.length,
            pendingBookings: pendingBookings.length,
            completedBookings: completedBookings.length,
            recentBookings: bookings.slice(0, 3),
            monthlyRevenue
        };

        res.json({
            success: true,
            dashboardData
        });

    } catch (error) {
        console.log(error.message);

        res.json({
            success: false,
            message: error.message
        });
    }
};


// API to Update User Image
export const updateUserImage = async (req, res) => {
    try {
        const { _id } = req.user;

        const imageFile = req.file;

        // Upload Image to ImageKit
        const response = await imagekit.files.upload({
            file: fs.createReadStream(imageFile.path),
            fileName: imageFile.originalname,
            folder: "/users"
        });

        // Generate optimized ImageKit URL
        const optimizedImageUrl = imagekit.helper.buildSrc({
            urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
            src: response.filePath,
            transformation: [
                {
                    width: 400,
                    quality: 80,
                    format: "webp"
                }
            ]
        });

        const image = optimizedImageUrl;

        // Update user image
        await User.findByIdAndUpdate(_id, {
            image
        });

        res.json({
            success: true,
            message: "Image Updated"
        });

    } catch (error) {
        console.log(error.message);

        res.json({
            success: false,
            message: error.message
        });
    }
};