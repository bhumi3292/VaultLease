// import mongoose from 'mongoose';
//
// const paymentRecordSchema = mongoose.Schema(
//     {
//         user: {
//             type: mongoose.Schema.Types.ObjectId,
//             ref: 'User',
//             required: false, // User might be optional for some generic payments
//         },
//         amount: { // The base amount of the product/service
//             type: Number,
//             required: true,
//             default: 0,
//         },
//         totalAmountPaid: { // The total amount sent to eSewa (including charges)
//             type: Number,
//             required: true,
//             default: 0,
//         },
//         productName: {
//             type: String,
//             required: true,
//             trim: true,
//         },
//         status: {
//             type: String,
//             enum: ['pending', 'paid', 'failed', 'cancelled'], // Using 'paid' for consistency
//             default: 'pending',
//         },
//         paymentMethod: {
//             type: String,
//             enum: ['khalti', 'esewa'],
//             required: true,
//         },
//         transactionId: { // Your internal unique ID for this transaction (eSewa's transaction_uuid)
//             type: String,
//             required: true,
//             unique: true,
//         },
//         eSewaResponse: { // Store the full eSewa response for auditing
//             type: mongoose.Schema.Types.Mixed,
//             required: false,
//         },
//         paidAt: {
//             type: Date,
//             required: false,
//         },
//         referenceId: { // To link payment to a specific entity like a property, ad, etc.
//             type: mongoose.Schema.Types.ObjectId,
//             required: false,
//             // You might want to add `ref` here depending on what `referenceId` refers to
//             // e.g., ref: 'Property' if it's for property listings
//         },
//         context: { // To categorize the payment type (e.g., 'listing_fee', 'premium_ad', 'utility_bill')
//             type: String,
//             required: false,
//             default: 'general_payment',
//         },
//         // Optional fields to store breakdown of charges
//         serviceCharge: { type: Number, default: 0 },
//         taxAmount: { type: Number, default: 0 },
//         deliveryCharge: { type: Number, default: 0 },
//     },
//     {
//         timestamps: true,
//     }
// );
//
// const PaymentRecord = mongoose.model('PaymentRecord', paymentRecordSchema);
//
// export default PaymentRecord;