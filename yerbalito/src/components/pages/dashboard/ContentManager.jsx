import { useState } from "react";
import { Box, Tabs, Tab, Typography } from "@mui/material";
import BlogList from "./BlogList";
import NoticiaList from "./NoticiaList";

const ContentManager = () => {
  const [currentTab, setCurrentTab] = useState(0);

  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
  };

  return (
    <Box className="slide-up">
      <Typography variant="h4" gutterBottom sx={{ color: "white", mb: 3 }}>
        Gestión de Contenido
      </Typography>

      <Box sx={{ borderBottom: 1, borderColor: 'rgba(255,255,255,0.2)', mb: 3 }}>
        <Tabs 
          value={currentTab} 
          onChange={handleTabChange}
          sx={{
            '& .MuiTab-root': {
              color: 'rgba(255,255,255,0.7)',
              fontWeight: 'bold',
              fontSize: '1rem',
            },
            '& .Mui-selected': {
              color: '#4CAF50 !important',
            },
            '& .MuiTabs-indicator': {
              backgroundColor: '#4CAF50',
            },
          }}
        >
          <Tab label="Blogs" />
          <Tab label="Noticias" />
        </Tabs>
      </Box>

      <Box>
        {currentTab === 0 && <BlogList />}
        {currentTab === 1 && <NoticiaList />}
      </Box>
    </Box>
  );
};

export default ContentManager;

