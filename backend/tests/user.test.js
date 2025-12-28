const request = require("supertest");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const app = require("../index"); // Adjust path if your main app file is elsewhere
const User = require("../models/User");
const Category = require("../models/Category");
const Property = require("../models/Property");
const Cart = require("../models/Cart");

// --- Global variables for the Auth/Category/Property Basic test suite ---
let landlordTokenAuthDB; // Renamed for clarity in isolated DB context
let categoryIdAuthDB;
let resetToken;
const testUserEmailForReset = "resettestuser@example.com";

// --- Variables specific to Cart API tests ---
let tenantTokenCartDB; // Renamed for clarity
let testPropertyIdForCart;
let testTenantIdCartDB;
let testCategoryIdForCart;
let landlordTokenForCartTests;


// --- Auth, Category, Property Basic Tests (using vaultlease_test_auth) ---
describe("Auth, Category, and Basic Property API Tests", () => {
    // beforeAll for this specific test suite (Auth, Category, Property Basic)
    beforeAll(async () => {
        process.env.MONGO_URI = "mongodb://localhost:27017/vaultlease_test_auth";

        // Ensure disconnection from any previous connection if it's not the correct DB
        if (mongoose.connection.readyState === 1 && mongoose.connection.name !== 'vaultlease_test_auth') {
            await mongoose.disconnect();
            console.log("Disconnected from previous non-auth DB connection.");
        }
        // Connect only if not already connected to the correct DB
        if (mongoose.connection.readyState === 0 || mongoose.connection.name !== 'vaultlease_test_auth') {
            await mongoose.connect(process.env.MONGO_URI);
            console.log(`Connected to Auth DB: ${mongoose.connection.name}`);
        }

        console.log("Dropping auth test database for clean setup...");
        await mongoose.connection.dropDatabase();
        console.log("Auth Database dropped. Starting setup...");

        // Register landlord
        const landlordRegisterRes = await request(app).post("/api/auth/register").send({
            fullName: "Test Landlord Auth DB",
            email: "landlord@auth.com",
            phoneNumber: "9800000000",
            stakeholder: "Landlord",
            password: "password123",
            confirmPassword: "password123",
        });
        expect(landlordRegisterRes.statusCode).toBe(201);

        // Login landlord
        const landlordLoginRes = await request(app).post("/api/auth/login").send({
            email: "landlord@auth.com",
            password: "password123",
        });
        expect(landlordLoginRes.statusCode).toBe(200);
        landlordTokenAuthDB = landlordLoginRes.body.token;

        // Create user for password reset tests
        await request(app).post("/api/auth/register").send({
            fullName: "Reset Test User",
            email: testUserEmailForReset,
            phoneNumber: "9876543210",
            stakeholder: "Tenant",
            password: "oldpassword123",
            confirmPassword: "oldpassword123",
        });

        console.log("Auth, Category, Property Basic setup complete.");
    });

    // afterAll for this specific test suite
    afterAll(async () => {
        if (mongoose.connection.readyState !== 0 && mongoose.connection.name === 'vaultlease_test_auth') {
            console.log("Disconnecting from Auth MongoDB...");
            await mongoose.disconnect();
        }
    });

    describe("User Authentication API", () => {
        test("should validate missing fields while creating user", async () => {
            const res = await request(app).post("/api/auth/register").send({
                fullName: "Ram Bahadur",
                email: "ramtemp@gmail.com",
                phoneNumber: "9800000000",
                stakeholder: "Tenant",
                // missing password + confirmPassword
            });

            expect(res.statusCode).toBe(400);
            expect(res.body.success).toBe(false);
            expect(res.body.message).toBe("Please fill all the fields");

            await User.deleteOne({ email: "ramtemp@gmail.com" }); // Clean up if any created
        });

        test("should create a user with all fields", async () => {
            const res = await request(app).post("/api/auth/register").send({
                fullName: "Ram Singh",
                email: "ramsingh@auth.com",
                phoneNumber: "9800000001",
                stakeholder: "Tenant",
                password: "password123",
                confirmPassword: "password123",
            });

            expect(res.statusCode).toBe(201);
            expect(res.body.success).toBe(true);
            expect(res.body.message).toBe("User registered successfully");

            await User.deleteOne({ email: "ramsingh@auth.com" }); // Clean up
        });

        test("should login a user with valid credentials (landlord)", async () => {
            const res = await request(app).post("/api/auth/login").send({
                email: "landlord@auth.com",
                password: "password123",
            });

            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
            expect(typeof res.body.token).toBe("string");
        });
    });

    describe("Password Reset Flow", () => {
        test("should request password reset link", async () => {
            const res = await request(app)
                .post("/api/auth/request-reset/send-link")
                .send({ email: testUserEmailForReset });

            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.message).toMatch(/password reset link has been sent/i);

            const user = await User.findOne({ email: testUserEmailForReset });
            if (user && process.env.JWT_SECRET) {
                resetToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
                    expiresIn: "1h",
                });
            } else {
                console.warn("Could not generate reset token for testing.");
                resetToken = "mock_invalid_token_for_test";
            }
        });

        test("should reset password with valid token", async () => {
            if (!resetToken || resetToken === "mock_invalid_token_for_test") {
                console.warn("Skipping reset password test: resetToken not available.");
                return;
            }

            const res = await request(app)
                .post(`/api/auth/reset-password/${resetToken}`)
                .send({
                    newPassword: "newpassword123",
                    confirmPassword: "newpassword123",
                });

            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.message).toBe("Password has been reset successfully.");

            // Verify login with new password
            const loginRes = await request(app).post("/api/auth/login").send({
                email: testUserEmailForReset,
                password: "newpassword123",
            });
            expect(loginRes.statusCode).toBe(200);
            expect(loginRes.body.success).toBe(true);
        });

        test("should fail reset with invalid token", async () => {
            const res = await request(app)
                .post("/api/auth/reset-password/invalidtoken123")
                .send({
                    newPassword: "anotherpass123",
                    confirmPassword: "anotherpass123",
                });

            expect(res.statusCode).toBe(400);
            expect(res.body.success).toBe(false);
            expect(res.body.message).toMatch(/invalid|expired token/i);
        });
    });

    describe("Category API", () => {
        test("should create a new category", async () => {
            const res = await request(app)
                .post("/api/category")
                .set("Authorization", `Bearer ${landlordTokenAuthDB}`)
                .send({ name: "Category For Auth Test" });

            expect(res.statusCode).toBe(201);
            expect(res.body.success).toBe(true);
            expect(res.body.data.category_name).toBe("Category For Auth Test");
            categoryIdAuthDB = res.body.data._id;
        });

        test("should not create duplicate category", async () => {
            const res = await request(app)
                .post("/api/category")
                .set("Authorization", `Bearer ${landlordTokenAuthDB}`)
                .send({ name: "Category For Auth Test" });

            expect(res.statusCode).toBe(400);
            expect(res.body.success).toBe(false);
            expect(res.body.message).toBe("Category already exists");
        });

        test("should fetch all categories", async () => {
            const res = await request(app).get("/api/category");
            expect(res.statusCode).toBe(200);
            expect(Array.isArray(res.body.data)).toBe(true);
            expect(res.body.data.length).toBeGreaterThanOrEqual(1);
        });

        test("should fetch category by ID", async () => {
            if (!categoryIdAuthDB) {
                const category = await Category.findOne({
                    category_name: "Category For Auth Test",
                });
                if (category) categoryIdAuthDB = category._id;
            }
            expect(categoryIdAuthDB).toBeDefined();

            const res = await request(app).get(`/api/category/${categoryIdAuthDB}`);
            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data._id.toString()).toBe(categoryIdAuthDB.toString());
        });

        test("should return 404 for non-existent category ID", async () => {
            const res = await request(app).get(
                `/api/category/${new mongoose.Types.ObjectId()}`
            );
            expect(res.statusCode).toBe(404);
            expect(res.body.success).toBe(false);
            expect(res.body.message).toBe("Category not found");
        });

        test("should update a category", async () => {
            const temp = await Category.create({ category_name: "Temp Category To Update" });
            const res = await request(app)
                .put(`/api/category/${temp._id}`)
                .set("Authorization", `Bearer ${landlordTokenAuthDB}`)
                .send({ name: "Updated Temp Category" });

            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.category_name).toBe("Updated Temp Category");
            await Category.deleteOne({ _id: temp._id }); // Clean up
        });

        test("should delete a category", async () => {
            const temp = await Category.create({ category_name: "Temp Category To Delete" });
            const res = await request(app)
                .delete(`/api/category/${temp._id}`)
                .set("Authorization", `Bearer ${landlordTokenAuthDB}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.message).toBe("Category deleted");
        });

        test("should 404 deleting non-existent category", async () => {
            const res = await request(app)
                .delete(`/api/category/${new mongoose.Types.ObjectId()}`)
                .set("Authorization", `Bearer ${landlordTokenAuthDB}`);
            expect(res.statusCode).toBe(404);
            expect(res.body.success).toBe(false);
            expect(res.body.message).toBe("Category not found");
        });
    });

    describe("Property API (Basic)", () => {
        let tempPropertyId;
        let tempCategoryId;

        beforeAll(async () => {
            // Create category first
            const categoryRes = await request(app)
                .post("/api/category")
                .set("Authorization", `Bearer ${landlordTokenAuthDB}`)
                .send({ name: "Temp Property Category for Property API Test" });

            expect(categoryRes.statusCode).toBe(201);
            tempCategoryId = categoryRes.body.data._id;

            // Create property with all required fields
            const propertyRes = await request(app)
                .post("/api/properties")
                .set("Authorization", `Bearer ${landlordTokenAuthDB}`)
                .send({
                    title: "Temp Property for Property API Test",
                    description: "A temp property for testing Property API.",
                    price: 10000,
                    location: "Temp City for Property API Test",
                    bedrooms: 1,
                    bathrooms: 1,
                    categoryId: tempCategoryId,
                    images: ["http://example.com/temp_prop.jpg"],
                    videos: [],
                });

            expect(propertyRes.statusCode).toBe(201);
            expect(propertyRes.body.success).toBe(true);
            expect(propertyRes.body.data).toBeDefined();
            expect(propertyRes.body.data._id).toBeDefined();
            tempPropertyId = propertyRes.body.data._id;
        });

        afterAll(async () => {
            if (tempPropertyId) {
                await Property.deleteOne({ _id: tempPropertyId });
            }
            if (tempCategoryId) {
                await Category.deleteOne({ _id: tempCategoryId });
            }
        });

        test("should get all properties", async () => {
            const res = await request(app).get("/api/properties");
            expect(res.statusCode).toBe(200);
            expect(Array.isArray(res.body.data)).toBe(true);
            expect(res.body.data.length).toBeGreaterThanOrEqual(1);
        });

        test("should 404 deleting non-existent property", async () => {
            const res = await request(app)
                .delete(`/api/properties/${new mongoose.Types.ObjectId()}`)
                .set("Authorization", `Bearer ${landlordTokenAuthDB}`);
            expect(res.statusCode).toBe(404);
            expect(res.body.success).toBe(false);
            expect(res.body.message).toBe("Property not found.");
        });
    });
});

// --- Cart API Tests (using fortirent_test_cart) ---
describe("Cart API Tests", () => {
    // beforeAll for Cart API tests
    beforeAll(async () => {
        process.env.MONGO_URI = "mongodb://localhost:27017/vaultlease_test_cart";

        // Ensure disconnection from any previous connection if it's not the correct DB
        if (mongoose.connection.readyState === 1 && mongoose.connection.name !== 'vaultlease_test_cart') {
            await mongoose.disconnect();
            console.log("Disconnected from previous non-cart DB connection.");
        }
        // Connect only if not already connected to the correct DB
        if (mongoose.connection.readyState === 0 || mongoose.connection.name !== 'vaultlease_test_cart') {
            await mongoose.connect(process.env.MONGO_URI);
            console.log(`Connected to Cart DB: ${mongoose.connection.name}`);
        }

        console.log("Dropping cart test database for clean setup...");
        await mongoose.connection.dropDatabase();
        console.log("Cart Database dropped. Starting setup...");

        // Register and login a tenant user for cart operations
        const tenantRegisterRes = await request(app).post("/api/auth/register").send({
            fullName: "Cart Test Tenant",
            email: "tenant@cart.com",
            phoneNumber: "9811111111",
            stakeholder: "Tenant",
            password: "password123",
            confirmPassword: "password123",
        });
        expect(tenantRegisterRes.statusCode).toBe(201);

        const tenantLoginRes = await request(app).post("/api/auth/login").send({
            email: "tenant@cart.com",
            password: "password123",
        });
        expect(tenantLoginRes.statusCode).toBe(200);
        tenantTokenCartDB = tenantLoginRes.body.token;

        const tenantUser = await User.findOne({ email: "tenant@cart.com" });
        testTenantIdCartDB = tenantUser._id;

        // Register and login a landlord user specific to this cart test DB
        const landlordRegisterResForCart = await request(app).post("/api/auth/register").send({
            fullName: "Landlord For Cart Tests",
            email: "landlord@cartdb.com",
            phoneNumber: "9833333333",
            stakeholder: "Landlord",
            password: "password123",
            confirmPassword: "password123",
        });
        expect(landlordRegisterResForCart.statusCode).toBe(201);

        const landlordLoginResForCart = await request(app).post("/api/auth/login").send({
            email: "landlord@cartdb.com",
            password: "password123",
        });
        expect(landlordLoginResForCart.statusCode).toBe(200);
        landlordTokenForCartTests = landlordLoginResForCart.body.token;

        // Create a category for the property (using the NEW landlordTokenForCartTests)
        const categoryRes = await request(app)
            .post("/api/category")
            .set("Authorization", `Bearer ${landlordTokenForCartTests}`)
            .send({ name: "Cart Test Category for Property" });
        expect(categoryRes.statusCode).toBe(201);
        testCategoryIdForCart = categoryRes.body.data._id;

        // Create a property for testing cart functionality (using the NEW landlordTokenForCartTests)
        const propertyRes = await request(app)
            .post("/api/properties")
            .set("Authorization", `Bearer ${landlordTokenForCartTests}`)
            .send({
                title: "Cart Test Property",
                description: "A lovely place to test cart.",
                price: 50000,
                location: "Test City",
                bedrooms: 2,
                bathrooms: 1,
                categoryId: testCategoryIdForCart,
                images: ["http://example.com/property.jpg"],
                videos: [],
            });
        expect(propertyRes.statusCode).toBe(201);
        testPropertyIdForCart = propertyRes.body.data._id;

        console.log("Cart setup complete.");
    });

    // afterAll for Cart API tests
    afterAll(async () => {
        if (mongoose.connection.readyState !== 0 && mongoose.connection.name === 'vaultlease_test_cart') {
            console.log("Disconnecting from Cart MongoDB...");
            await mongoose.disconnect();
        }
    });

    // Test 1: Get an empty cart for a new user
    test("should return an empty cart for a new user", async () => {
        await Cart.deleteMany({ user: testTenantIdCartDB }); // Ensure no existing cart

        const res = await request(app)
            .get("/api/cart")
            .set("Authorization", `Bearer ${tenantTokenCartDB}`);

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.message).toBe("Cart is empty or not yet created.");
        expect(res.body.data.items).toEqual([]);
        expect(res.body.data.user.toString()).toBe(testTenantIdCartDB.toString());
    });

    // Test 2: Add a property to the cart (first item, creates cart)
    test("should add a property to cart and create a new cart if none exists", async () => {
        await Cart.deleteMany({ user: testTenantIdCartDB }); // Ensure no existing cart

        const res = await request(app)
            .post("/api/cart/add")
            .set("Authorization", `Bearer ${tenantTokenCartDB}`)
            .send({ propertyId: testPropertyIdForCart });

        expect(res.statusCode).toBe(201);
        expect(res.body.success).toBe(true);
        expect(res.body.message).toBe("Cart created and property added.");
        expect(res.body.data.items.length).toBe(1);
        expect(res.body.data.items[0].property.toString()).toBe(testPropertyIdForCart.toString());

        // Verify it's in the DB
        const cart = await Cart.findOne({ user: testTenantIdCartDB });
        expect(cart).toBeDefined();
        expect(cart.items.length).toBe(1);
        expect(cart.items[0].property.toString()).toBe(testPropertyIdForCart.toString());
    });

    // Test 3: Add an existing property to the cart (should fail)
    test("should not add a property that is already in the cart", async () => {
        // This test assumes the previous test (Test 2) added the property.
        const res = await request(app)
            .post("/api/cart/add")
            .set("Authorization", `Bearer ${tenantTokenCartDB}`)
            .send({ propertyId: testPropertyIdForCart });

        expect(res.statusCode).toBe(409);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toBe("Property already in cart.");

        // Ensure cart still has only 1 item
        const cart = await Cart.findOne({ user: testTenantIdCartDB });
        expect(cart.items.length).toBe(1);
    });

    // Test 4: Get cart with items
    test("should retrieve cart with added items", async () => {
        // This test assumes items are already in the cart from previous tests.
        const res = await request(app)
            .get("/api/cart")
            .set("Authorization", `Bearer ${tenantTokenCartDB}`);

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.message).toBe("Cart retrieved successfully.");
        expect(res.body.data.items.length).toBe(1);
        expect(res.body.data.items[0].property._id.toString()).toBe(testPropertyIdForCart.toString());
        expect(res.body.data.items[0].property.title).toBe("Cart Test Property"); // Check populated data
    });

    // Test 5: Remove a property from the cart
    test("should remove a property from the cart", async () => {
        const res = await request(app)
            .delete(`/api/cart/remove/${testPropertyIdForCart}`)
            .set("Authorization", `Bearer ${tenantTokenCartDB}`);

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.message).toBe("Property removed from cart.");
        expect(res.body.data.items).toEqual([]);

        // Verify it's removed from DB
        const cart = await Cart.findOne({ user: testTenantIdCartDB });
        expect(cart.items).toEqual([]);
    });

    // Test 6: Try to remove a non-existent property from cart
    test("should return 404 when trying to remove a property not in cart", async () => {
        // Ensure cart is empty for this test
        await Cart.updateOne({ user: testTenantIdCartDB }, { $set: { items: [] } });

        const nonExistentPropertyId = new mongoose.Types.ObjectId();
        const res = await request(app)
            .delete(`/api/cart/remove/${nonExistentPropertyId}`)
            .set("Authorization", `Bearer ${tenantTokenCartDB}`);

        expect(res.statusCode).toBe(404);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toBe("Property not found in cart.");
    });

    // Test 7: Clear the entire cart
    test("should clear all items from the cart", async () => {
        // Add item back to cart for clearing this test
        await request(app)
            .post("/api/cart/add")
            .set("Authorization", `Bearer ${tenantTokenCartDB}`)
            .send({ propertyId: testPropertyIdForCart });

        const res = await request(app)
            .delete("/api/cart/clear")
            .set("Authorization", `Bearer ${tenantTokenCartDB}`);

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.message).toBe("Cart cleared successfully.");

        // Verify cart is empty or deleted from DB (it should be deleted)
        const cart = await Cart.findOne({ user: testTenantIdCartDB });
        expect(cart).toBeNull(); // Because deleteOne removes the document
    });

    // Test 8: Try to clear an already empty or non-existent cart
    test("should return 404 when trying to clear a non-existent cart", async () => {
        // Ensure cart is already deleted for this test
        await Cart.deleteOne({ user: testTenantIdCartDB });

        const res = await request(app)
            .delete("/api/cart/clear")
            .set("Authorization", `Bearer ${tenantTokenCartDB}`);

        expect(res.statusCode).toBe(404);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toBe("Cart not found to clear.");
    });

    // Test 9: Add to cart with invalid propertyId (missing)
    test("should return 400 if propertyId is missing when adding to cart", async () => {
        const res = await request(app)
            .post("/api/cart/add")
            .set("Authorization", `Bearer ${tenantTokenCartDB}`)
            .send({}); // Missing propertyId

        expect(res.statusCode).toBe(400);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toBe("Property ID is required to add to cart.");
    });

    // Test 10: Add to cart with non-existent propertyId
    test("should return 404 if property does not exist when adding to cart", async () => {
        const nonExistentId = new mongoose.Types.ObjectId();
        const res = await request(app)
            .post("/api/cart/add")
            .set("Authorization", `Bearer ${tenantTokenCartDB}`)
            .send({ propertyId: nonExistentId });

        expect(res.statusCode).toBe(404);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toBe("Property not found.");
    });

    // Test 11: Access cart routes without authentication
    test("should return 401 if no token is provided for cart routes", async () => {
        // Corrected expectation for the error message from authentication middleware
        const expectedAuthMessage = "Access token missing or invalid";

        const resGet = await request(app).get("/api/cart");
        expect(resGet.statusCode).toBe(401);
        expect(resGet.body.message).toBe(expectedAuthMessage);

        const resPost = await request(app).post("/api/cart/add").send({ propertyId: testPropertyIdForCart });
        expect(resPost.statusCode).toBe(401);
        expect(resPost.body.message).toBe(expectedAuthMessage);

        const resDeleteRemove = await request(app).delete(`/api/cart/remove/${testPropertyIdForCart}`);
        expect(resDeleteRemove.statusCode).toBe(401);
        expect(resDeleteRemove.body.message).toBe(expectedAuthMessage);

        const resDeleteClear = await request(app).delete("/api/cart/clear");
        expect(resDeleteClear.statusCode).toBe(401);
        expect(resDeleteClear.body.message).toBe(expectedAuthMessage);
    });
});