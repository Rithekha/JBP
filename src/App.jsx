// src/App.jsx
import React, { useState } from "react";
import "./App.css"; // Import the CSS file

const App = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    cv: null,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleFileChange = (e) => {
    setFormData({
      ...formData,
      cv: e.target.files[0], // Store the uploaded file
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const form = new FormData();
    form.append("name", formData.name);
    form.append("email", formData.email);
    form.append("phone", formData.phone);
    form.append("cv", formData.cv); // Append the CV file

    try {
      const response = await fetch("http://localhost:5000/api/apply", {
        method: "POST",
        body: form,
      });

      if (response.ok) {
        alert("Application submitted successfully!");
        setFormData({ name: "", email: "", phone: "", cv: null }); // Reset the form fields
      } else {
        alert("Error submitting application.");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Error submitting application.");
    }
  };

  return (
    <form id="applicationForm" onSubmit={handleSubmit}>
      <input
        type="text"
        name="name"
        value={formData.name}
        onChange={handleChange}
        placeholder="Name"
        required
      />
      <input
        type="email"
        name="email"
        value={formData.email}
        onChange={handleChange}
        placeholder="Email"
        required
      />
      <input
        type="tel"
        name="phone"
        value={formData.phone}
        onChange={handleChange}
        placeholder="Phone Number"
        required
      />
      <input
        type="file"
        name="cv"
        onChange={handleFileChange}
        accept=".pdf,.docx"
        required
      />
      <button type="submit">Submit Application</button>
    </form>
  );
};

export default App;
