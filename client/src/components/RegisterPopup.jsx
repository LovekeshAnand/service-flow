import { useState } from "react";

const RegisterPopup = ({ isOpen, onClose, onRegisterSuccess }) => {
  const [registerType, setRegisterType] = useState(null);
  const [formData, setFormData] = useState({
    username: "",
    fullname: "",
    email: "",
    password: "",
    serviceName: "",
    description: "",
    logo: null,
  });
  const [errorMessage, setErrorMessage] = useState("");

  const resetForm = () => {
    setRegisterType(null);
    setFormData({
      username: "",
      fullname: "",
      email: "",
      password: "",
      serviceName: "",
      description: "",
      logo: null,
    });
    setErrorMessage("");
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setFormData((prev) => ({ ...prev, logo: file }));
  };

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    const API_BASE = "http://localhost:8000/api/v1";
    const registerUrl =
      registerType === "user"
        ? `${API_BASE}/users/register`
        : `${API_BASE}/services/register`;

    const formDataToSend = new FormData();

    if (registerType === "user") {
      if (!formData.username || !formData.fullName || !formData.email || !formData.password) {
        setErrorMessage("All fields are required.");
        return;
      }
      formDataToSend.append("username", formData.username.trim());
      formDataToSend.append("fullname", formData.fullname.trim());
      formDataToSend.append("email", formData.email.trim());
      formDataToSend.append("password", formData.password);
    } else {
      if (!formData.serviceName || !formData.email || !formData.password || !formData.description) {
        setErrorMessage("All fields are required.");
        return;
      }
      formDataToSend.append("serviceName", formData.serviceName.trim());
      formDataToSend.append("email", formData.email.trim());
      formDataToSend.append("password", formData.password);
      formDataToSend.append("description", formData.description.trim());

      if (formData.logo) {
        formDataToSend.append("logo", formData.logo);
      } else {
        setErrorMessage("Please upload a logo.");
        return;
      }
    }

    try {
      const response = await fetch(registerUrl, {
        method: "POST",
        body: formDataToSend,
      });

      const responseData = await response.json();

      if (response.ok) {
        alert("Registration successful!");
        onRegisterSuccess();
        resetForm();
        onClose();
      } else {
        setErrorMessage(responseData.message || "Registration failed. Try again.");
      }
    } catch (error) {
      console.error("Error:", error);
      setErrorMessage("Something went wrong. Please try again.");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
        {registerType === null ? (
          <>
            <h2 className="text-xl font-bold mb-4 text-center">Register As</h2>
            <div className="flex flex-col gap-4">
              <button
                onClick={() => setRegisterType("user")}
                className="bg-green-500 text-white p-3 rounded-lg hover:bg-green-600"
              >
                Register as User
              </button>
              <button
                onClick={() => setRegisterType("service")}
                className="bg-green-500 text-white p-3 rounded-lg hover:bg-green-600"
              >
                Register as Service
              </button>
            </div>
          </>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <h2 className="text-xl font-bold mb-2 text-center">
              {registerType === "user" ? "Register as a User" : "Register as a Service"}
            </h2>

            {errorMessage && (
              <p className="text-red-500 text-center font-semibold">{errorMessage}</p>
            )}

            {registerType === "user" ? (
              <>
                <input
                  type="text"
                  name="username"
                  placeholder="Username"
                  value={formData.username}
                  onChange={handleChange}
                  className="border p-2 rounded-lg bg-gray-100 focus:ring-2 focus:ring-green-500"
                />
                <input
                  type="text"
                  name="fullName"
                  placeholder="Full Name"
                  value={formData.fullName}
                  onChange={handleChange}
                  className="border p-2 rounded-lg bg-gray-100 focus:ring-2 focus:ring-green-500"
                />
                <input
                  type="email"
                  name="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={handleChange}
                  className="border p-2 rounded-lg bg-gray-100 focus:ring-2 focus:ring-green-500"
                />
                <input
                  type="password"
                  name="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleChange}
                  className="border p-2 rounded-lg bg-gray-100 focus:ring-2 focus:ring-green-500"
                />
              </>
            ) : (
              <>
                <input
                  type="text"
                  name="serviceName"
                  placeholder="Service Name"
                  value={formData.serviceName}
                  onChange={handleChange}
                  className="border p-2 rounded-lg bg-gray-100 focus:ring-2 focus:ring-green-500"
                />
                <input
                  type="email"
                  name="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={handleChange}
                  className="border p-2 rounded-lg bg-gray-100 focus:ring-2 focus:ring-green-500"
                />
                <input
                  type="password"
                  name="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleChange}
                  className="border p-2 rounded-lg bg-gray-100 focus:ring-2 focus:ring-green-500"
                />
                <textarea
                  name="description"
                  placeholder="Description"
                  value={formData.description}
                  onChange={handleChange}
                  className="border p-2 rounded-lg bg-gray-100 focus:ring-2 focus:ring-green-500"
                />
                <label className="text-gray-700 font-semibold">
                  Upload your logo (rectangular preferred)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="border p-2 rounded-lg bg-gray-100 focus:ring-2 focus:ring-green-500"
                />
              </>
            )}

            <button
              type="submit"
              className="bg-green-500 text-white p-3 rounded-lg hover:bg-green-600"
            >
              Submit
            </button>
            <button
              onClick={() => {
                resetForm();
                onClose();
              }}
              className="bg-red-500 text-white p-3 rounded-lg hover:bg-red-600"
            >
              Cancel
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default RegisterPopup;
