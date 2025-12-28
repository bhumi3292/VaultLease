// src/product/ProductContextProvider.jsx
import { createContext, useState, useEffect } from "react"; // Removed useContext

export const ProductContext = createContext(null);

const ProductContextProvider = ({ children }) => {
    const [products, setProducts] = useState([]);
    const [loadingProducts, setLoadingProducts] = useState(true);
    const [error, setError] = useState(null);

    const fetchProducts = async () => {
        setLoadingProducts(true);
        setError(null);
        try {
            const response = await fetch('/api/products');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            setProducts(data);
            console.log("ProductContext: Products fetched successfully:", data);
        } catch (err) {
            console.error("ProductContext: Failed to fetch products:", err);
            setError(err.message || "Failed to load products.");
            setProducts([]); // Clear products on error
        } finally {
            setLoadingProducts(false);
        }
    };

    // Function to add a new product
    const addProduct = async (newProductData) => {
        setLoadingProducts(true); // Or use a separate loading state for adding
        setError(null);
        try {
            const addedProduct = { ...newProductData, id: Date.now() };
            setProducts(prevProducts => [...prevProducts, addedProduct]);
            console.log("ProductContext: Product added:", addedProduct);
            return addedProduct; // Return the newly added product
        } catch (err) {
            console.error("ProductContext: Failed to add product:", err);
            setError(err.message || "Failed to add product.");
            throw err; // Re-throw to allow component to catch
        } finally {
            setLoadingProducts(false);
        }
    };

    // Function to update an existing product
    const updateProduct = async (productId, updatedProductData) => {
        setLoadingProducts(true);
        setError(null);
        try {
            // For demonstration, simulate success
            const productAfterUpdate = { ...updatedProductData, id: productId };
            setProducts(prevProducts =>
                prevProducts.map(p => (p.id === productId ? productAfterUpdate : p))
            );
            console.log("ProductContext: Product updated:", productAfterUpdate);
            return productAfterUpdate;
        } catch (err) {
            console.error("ProductContext: Failed to update product:", err);
            setError(err.message || "Failed to update product.");
            throw err;
        } finally {
            setLoadingProducts(false);
        }
    };

    // Function to delete a product
    const deleteProduct = async (productId) => {
        setLoadingProducts(true);
        setError(null);
        try {
            setProducts(prevProducts => prevProducts.filter(p => p.id !== productId));
            console.log("ProductContext: Product deleted with ID:", productId);
        } catch (err) {
            console.error("ProductContext: Failed to delete product:", err);
            setError(err.message || "Failed to delete product.");
            throw err;
        } finally {
            setLoadingProducts(false);
        }
    };

    // Fetch products when the component mounts
    useEffect(() => {
        fetchProducts();
    }, []);

    return (
        <ProductContext.Provider
            value={{
                products,
                loadingProducts,
                error,
                fetchProducts,
                addProduct,
                updateProduct,
                deleteProduct,
            }}
        >
            {children}
        </ProductContext.Provider>
    );
};

export default ProductContextProvider;