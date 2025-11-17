import React, { useRef } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  IconButton,
  Tooltip,
} from "@mui/material";
import { Close as CloseIcon, PictureAsPdf as PdfIcon, Image as ImageIcon } from "@mui/icons-material";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

const PrintSquadsModal = ({ open, onClose, players, categoryName }) => {
  const printRef = useRef(null);

  const getStatusColor = (estado, tieneMesesAnterioresVencidos) => {
    if (estado === "Exonerado") return "#ff9800";
    if (estado === "Habilitado") return "#4caf50";
    if (tieneMesesAnterioresVencidos) return "#f44336";
    return "#ffc107"; // Amarillo para solo mes anterior vencido
  };

  const getStatusText = (estado, tieneMesesAnterioresVencidos) => {
    if (estado === "Exonerado") return "Exonerado";
    if (estado === "Habilitado") return "Al día";
    if (tieneMesesAnterioresVencidos) return "Vencido (múltiples meses)";
    return "Vencido (1 mes)";
  };

  const exportToPDF = async () => {
    if (!printRef.current) return;

    try {
      const canvas = await html2canvas(printRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
      const imgX = (pdfWidth - imgWidth * ratio) / 2;
      const imgY = 0;

      pdf.addImage(imgData, "PNG", imgX, imgY, imgWidth * ratio, imgHeight * ratio);
      
      const fileName = `Estado_Pagos_${categoryName || "Todas"}_${new Date().toISOString().split("T")[0]}.pdf`;
      pdf.save(fileName);
    } catch (error) {
      console.error("Error exportando a PDF:", error);
    }
  };

  const exportToPNG = async () => {
    if (!printRef.current) return;

    try {
      const canvas = await html2canvas(printRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
      });

      const imgData = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.download = `Estado_Pagos_${categoryName || "Todas"}_${new Date().toISOString().split("T")[0]}.png`;
      link.href = imgData;
      link.click();
    } catch (error) {
      console.error("Error exportando a PNG:", error);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: {
          backgroundColor: "rgba(0, 0, 0, 0.9)",
          color: "white",
        },
      }}
    >
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderBottom: "1px solid rgba(255, 255, 255, 0.2)",
        }}
      >
        <Typography variant="h6" component="div">
          Vista de Impresión - {categoryName || "Todas las categorías"}
        </Typography>
        <IconButton onClick={onClose} sx={{ color: "white" }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent>
        <Box
          ref={printRef}
          sx={{
            backgroundColor: "white",
            color: "black",
            padding: "20px",
            "@media print": {
              padding: "10px",
            },
          }}
        >
          {/* Header para impresión */}
          <Box sx={{ marginBottom: "20px", textAlign: "center" }}>
            <Typography variant="h4" component="h1" sx={{ fontWeight: "bold", marginBottom: "10px" }}>
              Estado de Pagos de Cuotas
            </Typography>
            <Typography variant="h6" component="h2" sx={{ color: "#666" }}>
              {categoryName || "Todas las categorías"}
            </Typography>
            <Typography variant="body2" sx={{ color: "#999", marginTop: "5px" }}>
              Fecha: {new Date().toLocaleDateString("es-UY", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </Typography>
          </Box>

          {/* Tabla de jugadores */}
          <Table sx={{ border: "1px solid #ddd" }}>
            <TableHead>
              <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
                <TableCell sx={{ fontWeight: "bold", border: "1px solid #ddd" }}>
                  #
                </TableCell>
                <TableCell sx={{ fontWeight: "bold", border: "1px solid #ddd" }}>
                  Nombre Completo
                </TableCell>
                <TableCell sx={{ fontWeight: "bold", border: "1px solid #ddd", textAlign: "center" }}>
                  Categoría
                </TableCell>
                <TableCell sx={{ fontWeight: "bold", border: "1px solid #ddd", textAlign: "center" }}>
                  Estado
                </TableCell>
                <TableCell sx={{ fontWeight: "bold", border: "1px solid #ddd", textAlign: "center" }}>
                  Último Mes Pago
                </TableCell>
                <TableCell sx={{ fontWeight: "bold", border: "1px solid #ddd", textAlign: "center" }}>
                  Año
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {players.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} sx={{ textAlign: "center", border: "1px solid #ddd" }}>
                    No hay jugadores para mostrar
                  </TableCell>
                </TableRow>
              ) : (
                players.map((player, index) => {
                  const statusColor = getStatusColor(
                    player.estado,
                    player.tieneMesesAnterioresVencidos
                  );
                  const statusText = getStatusText(
                    player.estado,
                    player.tieneMesesAnterioresVencidos
                  );

                  return (
                    <TableRow key={player.idjugador} sx={{ "&:nth-of-type(even)": { backgroundColor: "#f9f9f9" } }}>
                      <TableCell sx={{ border: "1px solid #ddd" }}>
                        {index + 1}
                      </TableCell>
                      <TableCell sx={{ border: "1px solid #ddd", fontWeight: "500" }}>
                        {player.nombre} {player.apellido}
                      </TableCell>
                      <TableCell sx={{ border: "1px solid #ddd", textAlign: "center" }}>
                        {player.categoria}
                      </TableCell>
                      <TableCell sx={{ border: "1px solid #ddd", textAlign: "center" }}>
                        <Box
                          sx={{
                            display: "inline-block",
                            padding: "4px 12px",
                            borderRadius: "4px",
                            backgroundColor: statusColor,
                            color: "white",
                            fontWeight: "bold",
                            fontSize: "0.875rem",
                          }}
                        >
                          {statusText}
                        </Box>
                      </TableCell>
                      <TableCell
                        sx={{
                          border: "1px solid #ddd",
                          textAlign: "center",
                          color: statusColor,
                          fontWeight: "bold",
                        }}
                      >
                        {player.ultimoMesPago}
                      </TableCell>
                      <TableCell sx={{ border: "1px solid #ddd", textAlign: "center" }}>
                        {player.anioPago}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>

          {/* Footer con estadísticas */}
          <Box sx={{ marginTop: "20px", padding: "15px", backgroundColor: "#f5f5f5", borderRadius: "4px" }}>
            <Typography variant="body2" sx={{ fontWeight: "bold", marginBottom: "10px" }}>
              Resumen:
            </Typography>
            <Box sx={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
              <Typography variant="body2">
                Total jugadores: <strong>{players.length}</strong>
              </Typography>
              <Typography variant="body2" sx={{ color: "#4caf50" }}>
                Al día: <strong>{players.filter(p => p.estado === "Habilitado").length}</strong>
              </Typography>
              <Typography variant="body2" sx={{ color: "#ffc107" }}>
                Vencido (1 mes): <strong>{players.filter(p => p.estado === "Deshabilitado" && !p.tieneMesesAnterioresVencidos).length}</strong>
              </Typography>
              <Typography variant="body2" sx={{ color: "#f44336" }}>
                Vencido (múltiples): <strong>{players.filter(p => p.estado === "Deshabilitado" && p.tieneMesesAnterioresVencidos).length}</strong>
              </Typography>
              <Typography variant="body2" sx={{ color: "#ff9800" }}>
                Exonerados: <strong>{players.filter(p => p.estado === "Exonerado").length}</strong>
              </Typography>
            </Box>
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ borderTop: "1px solid rgba(255, 255, 255, 0.2)", padding: "16px" }}>
        <Button onClick={handlePrint} variant="contained" sx={{ backgroundColor: "#1E8732", "&:hover": { backgroundColor: "#156525" } }}>
          Imprimir
        </Button>
        <Tooltip title="Exportar como PDF">
          <Button
            onClick={exportToPDF}
            variant="contained"
            startIcon={<PdfIcon />}
            sx={{ backgroundColor: "#d32f2f", "&:hover": { backgroundColor: "#b71c1c" } }}
          >
            PDF
          </Button>
        </Tooltip>
        <Tooltip title="Exportar como PNG">
          <Button
            onClick={exportToPNG}
            variant="contained"
            startIcon={<ImageIcon />}
            sx={{ backgroundColor: "#1976d2", "&:hover": { backgroundColor: "#1565c0" } }}
          >
            PNG
          </Button>
        </Tooltip>
        <Button onClick={onClose} variant="outlined" sx={{ color: "white", borderColor: "rgba(255, 255, 255, 0.5)" }}>
          Cerrar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PrintSquadsModal;

