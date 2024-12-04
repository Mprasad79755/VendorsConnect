import React, { useState } from "react";
import "./Class.css"; // Ensure to include styles matching the layout in the image

const CookingClassForm = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    selectedClass: null,
    selectedTime: "",
    selectedDate: "",
  });

  const classes = [
    { id: 1, name: "Indian Cooking", price: 10.0 },
    { id: 2, name: "Cake Baking ", price: 8.0 },
    { id: 3, name: "Nutrition", price: 10.0 },
    { id: 4, name: "Dessert ", price: 5.0 },
  ];

  const times = ["11:30 AM", "1:30 PM", "3:30 PM", "5:30 PM"];
  const conversionRate = 82; // Example conversion rate from USD to INR

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleClassSelection = (id) => {
    setFormData({ ...formData, selectedClass: id });
  };

  const handleTimeSelection = (time) => {
    setFormData({ ...formData, selectedTime: time });
  };

  const handleDateChange = (e) => {
    setFormData({ ...formData, selectedDate: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Form submitted:", formData);
  };

  const selectedClass = classes.find((cls) => cls.id === formData.selectedClass);
  const total = selectedClass ? selectedClass.price * conversionRate : 0;

  return (
    <form className="cooking-class-form" onSubmit={handleSubmit} style={{ backgroundColor: "#f5f5f5", padding: "20px", borderRadius: "8px" }}>
      <h2>Participant Name</h2>
      <div className="input-group">
        <input
          type="text"
          name="firstName"
          placeholder="First Name"
          value={formData.firstName}
          onChange={handleChange}
        />
        <input
          type="text"
          name="lastName"
          placeholder="Last Name"
          value={formData.lastName}
          onChange={handleChange}
        />
      </div>

      <h2>Email</h2>
      <input
        type="email"
        name="email"
        placeholder="example@example.com"
        value={formData.email}
        onChange={handleChange}
      />

      <h2>Phone Number</h2>
      <input
        type="tel"
        name="phone"
        placeholder="(000) 000-0000"
        value={formData.phone}
        onChange={handleChange}
      />

      <h2>Available Cooking Classes</h2>
      <div className="class-options">
        {classes.map((cls) => (
          <div
            key={cls.id}
            className={`class-option ${
              formData.selectedClass === cls.id ? "selected" : ""
            }`}
            onClick={() => handleClassSelection(cls.id)}
          >
            <h3>{cls.name}</h3>
            <p>₹{(cls.price * conversionRate).toFixed(2)}</p>
          </div>
        ))}
      </div>

      <h2>Please pick an available time for {selectedClass?.name || "class"}:</h2>
      <div className="time-options">
        {times.map((time) => (
          <button
            key={time}
            type="button"
            className={`time-option ${
              formData.selectedTime === time ? "selected" : ""
            }`}
            onClick={() => handleTimeSelection(time)}
          >
            {time}
          </button>
        ))}
      </div>

      <h2>Select a Date</h2>
      <input
        type="date"
        name="selectedDate"
        value={formData.selectedDate}
        onChange={handleDateChange}
        className="date-picker"
      />

      <div className="total">
        <h3>Total: ₹{total.toFixed(2)}</h3>
      </div>

      <button type="submit" className="submit-button">Submit</button>
    </form>
  );
};

export default CookingClassForm;