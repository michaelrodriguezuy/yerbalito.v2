import React, { useState, useEffect } from "react";
import { Box, IconButton, Tooltip } from "@mui/material";
import { Cake as CakeIcon } from "@mui/icons-material";
import { toast } from "sonner";
import axios from "axios";
import { API_ENDPOINTS } from "../../config/api";

const BirthdayNotification = () => {
  const [birthdayKids, setBirthdayKids] = useState([]);
  const [checkedToday, setCheckedToday] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    checkBirthdays();
  }, []);

  const checkBirthdays = async () => {
    try {
      setIsLoading(true);
      console.log("🎂 Checking birthdays...");
      console.log("🎂 API endpoint:", API_ENDPOINTS.CUMPLES);
      
      const response = await axios.get(API_ENDPOINTS.CUMPLES);
      console.log("🎂 Full response:", response);
      console.log("🎂 Response data:", response.data);
      
      const todayBirthdays = response.data.cumples || [];
      
      console.log("🎂 Birthday data received:", todayBirthdays);
      console.log("🎂 Number of birthdays:", todayBirthdays.length);
      
      if (todayBirthdays.length > 0) {
        console.log("🎂 Found birthdays:", todayBirthdays.length);
        console.log("🎂 Birthday details:", todayBirthdays);
        setBirthdayKids(todayBirthdays);
        // No mostrar toast automáticamente, solo al hacer hover
      } else {
        console.log("🎂 No birthdays today");
        setBirthdayKids([]);
      }
      
      setCheckedToday(true);
        } catch (error) {
          console.error("🎂 Error checking birthdays:", error);
          console.error("🎂 Error details:", error.response?.data);
          // No mostrar toast de error
        } finally {
      setIsLoading(false);
    }
  };

  const getAge = (fechaNacimiento) => {
    const today = new Date();
    const birthDate = new Date(fechaNacimiento);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  };

  const showBirthdayToast = (birthdayKids) => {
    // NO mostrar toast automáticamente
    // Solo mostrar en el tooltip
  };

  return (
    <Box
      sx={{
        position: 'fixed',
        top: '50%',
        right: 20,
        transform: 'translateY(-50%)',
        zIndex: 9999,
        animation: birthdayKids.length > 0 ? 'bounce 2s infinite' : 'none',
        '@keyframes bounce': {
          '0%, 20%, 50%, 80%, 100%': {
            transform: 'translateY(-50%)',
          },
          '40%': {
            transform: 'translateY(-60%)',
          },
          '60%': {
            transform: 'translateY(-55%)',
          },
        }
      }}
    >
      <Tooltip
        title={
          <Box sx={{ textAlign: 'center', p: 1 }}>
            {birthdayKids.length > 0 ? (
              birthdayKids.map((kid, index) => (
                <Box key={index} sx={{ mb: 1 }}>
                  <strong>
                    Hoy cumple años {kid.nombre} {kid.apellido} 🎉
                  </strong>
                  <br />
                  {kid.categoria} - {getAge(kid.fecha_nacimiento)} años
                </Box>
              ))
            ) : (
              <Box>
                {isLoading ? (
                  <>
                    <strong>Verificando cumpleaños</strong>
                    <br />
                    Verificando...
                  </>
                ) : (
                  <>
                    <strong>Hoy nadie cumple</strong>
                  </>
                )}
              </Box>
            )}
          </Box>
        }
        onOpen={() => {
          // No hacer nada al abrir
        }}
        onClose={() => {
          // No hacer nada al cerrar
        }}
        disableHoverListener={false}
        disableFocusListener={true}
        disableTouchListener={true}
        arrow
        placement="left"
        PopperProps={{
          sx: {
            '& .MuiTooltip-tooltip': {
              backgroundColor: 'rgba(0, 0, 0, 0.9)',
              color: 'white',
              fontSize: '14px',
              borderRadius: '10px',
              border: '1px solid #4CAF50',
            },
            '& .MuiTooltip-arrow': {
              color: 'rgba(0, 0, 0, 0.9)',
            },
          },
        }}
      >
        <IconButton
          disabled={isLoading}
          sx={{
            background: birthdayKids.length > 0 
              ? 'linear-gradient(135deg, #4CAF50 0%, #66BB6A 100%)'
              : 'linear-gradient(135deg, #ffffff 0%, #f0f0f0 100%)',
            color: birthdayKids.length > 0 ? 'white' : '#4CAF50',
            width: 60,
            height: 60,
            fontSize: '2rem',
            boxShadow: birthdayKids.length > 0 
              ? '0 8px 25px rgba(76, 175, 80, 0.4)'
              : '0 8px 25px rgba(255, 215, 0, 0.4)',
            border: birthdayKids.length > 0 
              ? '3px solid #ffffff'
              : '3px solid #4CAF50',
            '&:hover': {
              background: birthdayKids.length > 0
                ? 'linear-gradient(135deg, #388E3C 0%, #4CAF50 100%)'
                : 'linear-gradient(135deg, #e0e0e0 0%, #ffffff 100%)',
              transform: 'scale(1.1)',
            },
            '&:disabled': {
              opacity: 0.7,
              transform: 'scale(0.95)',
            },
            transition: 'all 0.3s ease',
          }}
        >
          {isLoading ? '⏳' : '🎂'}
        </IconButton>
      </Tooltip>
    </Box>
  );
};

export default BirthdayNotification;