import React from "react";
import { FaRegEnvelope } from "react-icons/fa";

export default function Newsletter() {
    return (
        <div className="w-full bg-[#002c5f] text-white py-16 mt-20">
            <div className="w-full px-4 md:px-10 mx-auto text-center">
                <h3 className="text-white md:text-3xl font-semibold">
                    Get the latest listings and rental tips delivered to your inbox
                </h3>
                <form className="mt-10 flex flex-col md:flex-row justify-center items-center gap-4">
                    <input
                        type="email"
                        placeholder="Enter your email"
                        required
                        className="px-5 py-3 rounded-md text-black w-full md:w-[300px]"
                    />
                    <button
                        type="submit"
                        className="flex items-center gap-2 bg-white text-[#002c5f] px-6 py-3 rounded-md font-semibold"
                    >
                        <FaRegEnvelope />
                        Subscribe
                    </button>
                </form>
            </div>
        </div>
    );
}
