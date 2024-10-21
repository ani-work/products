const express = require('express');
const router = express.Router();
const HomeAndLiving = require("../models/HomeAndLiving");
const ErrorHandler = require("../middlewares/error");

router.get("/", async(req, res, next) => {

    const query = req.query;
    console.log("Query: ", query)

    const { page, limit, ...restQuery } = query;

    const queryObject = { ...restQuery };
    
// If the page number is not provided, set it to 1
  const pageNumber = parseInt(page) || 1;
  const productsLimit = parseInt(limit) || 21;
  // console.log("Page Number:", productsLimit);
  // console.log("Query:", query);
  try {
    // Fetch all Home & Living items from the database with pagination
    console.log("Query Object:", queryObject);
    let homeandliving = await HomeAndLiving.find(queryObject)
      .limit(productsLimit * 3)
      .skip((pageNumber - 1) * productsLimit); //finding all the homeandliving items according to the query
    // console.log(homeandliving);

    // Check if the homeandliving collection is empty
    if (!homeandliving || homeandliving.length === 0) {
      res.status(200).json({
        success: false,
        message: "No home & living items found",
        homeandliving: [],
      });
    }

    // console.log("Home & Living items:" homeandliving.length);
    let extraPages = Math.ceil(homeandliving.length / productsLimit);
    if (homeandliving.length > productsLimit) {
      homeandliving = homeandliving.slice(0, productsLimit); //slicing the home & living items according to the limit
    }

    // Send the home & living items as the response

    res.status(200).json({
      success: true,
      count: homeandliving.length,
      extraPages: extraPages - 1,
      homeandliving: homeandliving, //sending the retrieved home & living collection in response !
    });
  } catch (error) {
    console.log("An error occurred:", error.message);
    // Pass the error to the error-handling middleware
    return next(new ErrorHandler("Failed to retrieve Home & Living items", 500));
  }
})

router.get("/:id", async(req, res, next) => {
    try{
        const homeandlivingId = req.params["id"];

        let homeandliving = await HomeAndLiving.findById(homeandlivingId);

        res.json(homeandliving);

    }catch (err) {
        console.log("Error:", err);
        res.status(500).json({ message: err.message });
    }
})
//Posting a new entry in Home & Living
router.post("/", async (req, res, next) => {
    try {
      console.log("Request received");
      //Destructure all the props from the body
      const { title, description, image, affiliateLink, category, sub_category } =
        req.body;
      console.log("Body parsed");

      //Error message if any entry is missing
      if (
        !title ||
        !description ||
        !image ||
        !affiliateLink ||
        !category ||
        !sub_category
      ) {
        return next(new ErrorHandler("Error! Please Fill out the Details", 400));
      }
  
      console.log("All fields are present");
      //Creating the new entry
      
      const newHomeandLiving = await HomeAndLiving.create({
        title,
        description,
        image,
        affiliateLink,
        category,
        sub_category,
      });
      console.log("Home & Living created successfully");
      //Sending the json response if created properly

      res.status(201).json({
        success: true,
        message: "Home & Living Created Successfully!",
        product: newHomeandLiving,
      });
      console.log("Response sent");
    } catch (error) {
      console.log("An error occurred:", error);
  
      // Handle Mongoose validation errors
      if (error.name === "ValidationError") {
        const validationErrors = Object.values(error.errors).map(
          (err) => err.message
        );
        return next(new ErrorHandler(validationErrors.join(", "), 400));
      }
  
      // Handle other errors
      return next(error);
    }
  });
  
  // Update a homeandliving by ID
router.put("/:id", async (req, res, next) => {
    try {
      const homeandlivingId = req.params["id"];
      const { title, description, image, affiliateLink, category, sub_category } =
        req.body;
  
      // Find the Home & Living by ID and update it with the new data
      const updatedhomeandliving = await HomeAndLiving.findByIdAndUpdate(
        homeandlivingId,
        { title, description, image, affiliateLink, category, sub_category },
        { new: true, runValidators: true }
      );
  
      // If the Home & Living is not found, return an error
      if (!updatedhomeandliving) {
        return next(new ErrorHandler("Home & Living not found", 404));
      }
  
      // Send the updated product in the response
      res.status(200).json({
        success: true,
        message: "Home & Living updated successfully!",
        homeandliving: updatedhomeandliving,
      });
    } catch (error) {
      console.log("An error occurred:", error);
  
      // Handle Mongoose validation errors
      if (error.name === "ValidationError") {
        const validationErrors = Object.values(error.errors).map(
          (err) => err.message
        );
        return next(new ErrorHandler(validationErrors.join(", "), 400));
      }
  
      // Handle other errors
      return next(error);
    }
  });
  
  // Delete a product by ID
router.delete("/:id", async (req, res, next) => {
    try {
      const homeandlivingId = req.params["id"];
  
      // Find the Home & Living item by ID and delete it
      const deletedHomeandLiving = await HomeAndLiving.findByIdAndDelete(homeandlivingId);
  
      // If the Home & Living item is not found, return an error
      if (!deletedHomeandLiving) {
        return next(new ErrorHandler("KidsWear not found", 404));
      }
  
      // Send a success message
      res.status(200).json({
        success: true,
        message: "Home & Living deleted successfully!",
        product: deletedHomeandLiving, // Optionally returning the deleted Home & Living details
      });
    } catch (error) {
      console.log("An error occurred:", error);
      return next(error);
    }
  });
  
  module.exports = router;
  