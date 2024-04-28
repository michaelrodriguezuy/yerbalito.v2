import { useState } from "react";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    console.log(formData);
    // enviar el correo usando mi backend en nodejs
    fetch("http://localhost:3001/send-email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    });
    
    setFormData({
      name: "",
      email: "",
      message: "",
    });
  };

  return (
    <div className="container">
      <form onSubmit={handleSubmit}>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            maxWidth: 400,
            margin: "auto",
          }}
        >
          <TextField
            label="Nombre"
            variant="outlined"
            name="name"
            value={formData.name}
            onChange={handleChange}
            margin="normal"
            InputLabelProps={{ style: { color: "white" } }}

          />
          <TextField
            label="Email"
            variant="outlined"
            name="email"
            value={formData.email}
            onChange={handleChange}
            margin="normal"
            InputLabelProps={{ style: { color: "white" } }}

          />
          <TextField
            label="Mensaje"
            variant="outlined"
            multiline
            rows={4}
            name="message"
            value={formData.message}
            onChange={handleChange}
            margin="normal"
            InputLabelProps={{ style: { color: "white" } }}

          />
          <Button
            type="submit"
            variant="contained"
            color="primary"
            sx={{ marginTop: 2 }}
          >
            Enviar
          </Button>
        </Box>
      </form>
    </div>
  );
};

export default Contact;
