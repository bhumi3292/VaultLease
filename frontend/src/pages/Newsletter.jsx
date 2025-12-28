import React from "react";
import { FaRegEnvelope } from "react-icons/fa";

export default function Newsletter() {
    return (
        <div className="w-full bg-primary text-white py-16 mt-20">
            <div className="w-full px-4 md:px-10 mx-auto text-center">
                <h3 className="text-white md:text-3xl font-semibold font-heading">
                    Get the latest listings and rental tips delivered to your inbox
                </h3>
                <form className="mt-10 flex flex-col md:flex-row justify-center items-center gap-4">
                    <input
                        type="email"
                        placeholder="Enter your email"
                        required
                        className="px-5 py-3 rounded-md text-text-main w-full md:w-[300px] border-none outline-none focus:ring-2 focus:ring-secondary"
                    />
                    <button
                        type="submit"
                        className="flex items-center gap-2 bg-secondary text-primary hover:bg-white hover:text-primary transition-colors px-6 py-3 rounded-md font-semibold font-body"
                    >
                        <FaRegEnvelope />
                        Subscribe
                    </button>
                </form>
            </div>
        </div>
    );
}
