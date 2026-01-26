import React, { useState } from "react";

const PaymentModal = ({ amount, onClose, onSuccess }) => {
  const [step, setStep] = useState("confirm"); // confirm → processing → success

  const handlePay = () => {
    setStep("processing");

    setTimeout(() => {
      setStep("success");
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1500);
    }, 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">

        {step === "confirm" && (
          <>
            <h3 className="text-xl font-bold text-slate-900 mb-2">
              Confirm Payment
            </h3>
            <p className="text-slate-600 mb-6">
              You are about to pay
            </p>

            <div className="bg-slate-50 p-4 rounded-xl text-center mb-6">
              <p className="text-3xl font-extrabold text-emerald-600">
                ₹{amount}
              </p>
            </div>

            <button
              onClick={handlePay}
              className="w-full bg-emerald-500 text-white py-3 rounded-xl font-bold hover:bg-emerald-600"
            >
              Pay Now
            </button>

            <button
              onClick={onClose}
              className="mt-3 w-full text-slate-500 hover:underline"
            >
              Cancel
            </button>
          </>
        )}

        {step === "processing" && (
          <div className="text-center py-10">
            <div className="animate-spin w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="font-semibold text-slate-700">
              Processing Payment...
            </p>
          </div>
        )}

        {step === "success" && (
          <div className="text-center py-10">
            <div className="text-5xl mb-4">✅</div>
            <h3 className="text-xl font-bold text-emerald-600">
              Payment Successful
            </h3>
            <p className="text-slate-500 mt-2">
              Thank you for using HappyAuto
            </p>
          </div>
        )}

      </div>
    </div>
  );
};

export default PaymentModal;
