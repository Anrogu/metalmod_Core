package com.metalmod.core.Service;

import com.azure.identity.ClientSecretCredential;
import com.azure.identity.ClientSecretCredentialBuilder;
import com.metalmod.core.Dto.RefaccionDto;
import com.microsoft.graph.serviceclient.GraphServiceClient;
import org.apache.poi.ss.usermodel.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;
import java.util.ArrayList;
import java.util.List;

@Service
public class DashboardExcelService {

    @Value("${azure.tenant-id}")
    private String tenantId;
    @Value("${azure.client-id}")
    private String clientId;
    @Value("${azure.client-secret}")
    private String clientSecret;
    @Value("${excel.file.item-id}")
    private String fileItemId;

    // Rango de hojas a leer (índice 0-based). Hojas 6 a 22 => índices 5 a 21.
    private static final int PRIMERA_HOJA = 5;  // hoja #6
    private static final int ULTIMA_HOJA = 21;  // hoja #22

    // Columnas A(0) a G(6)
    private static final int COL_INICIO = 0;
    private static final int COL_FIN = 6;

    // Los datos empiezan en la fila 3 (Excel) => índice 2 (POI, 0-based)
    private static final int FILA_INICIO = 2;

    // 1. Método para leer desde Microsoft Cloud
    public List<RefaccionDto> obtenerDatosDesdeNube() {
        ClientSecretCredential credential = new ClientSecretCredentialBuilder()
                .clientId(clientId)
                .tenantId(tenantId)
                .clientSecret(clientSecret)
                .build();

        GraphServiceClient graphClient = new GraphServiceClient(credential, "https://graph.microsoft.com/.default");

        InputStream is = graphClient.drives().byDriveId("TU_DRIVE_ID")
                .items().byDriveItemId(fileItemId)
                .content()
                .get();

        return procesarExcel(is);
    }

    // 2. Método para leer desde un archivo subido manualmente
    public List<RefaccionDto> obtenerDatosDesdeArchivoLocal(MultipartFile file) {
        try {
            InputStream is = file.getInputStream();
            return procesarExcel(is);
        } catch (Exception e) {
            throw new RuntimeException("Error al leer el archivo subido: " + e.getMessage());
        }
    }

    // 3. Lógica principal: recorre las hojas 6 a 22, columnas A-G, desde la fila 3
    private List<RefaccionDto> procesarExcel(InputStream is) {
        List<RefaccionDto> datos = new ArrayList<>();

        try (Workbook workbook = WorkbookFactory.create(is)) {
            int totalHojas = workbook.getNumberOfSheets();
            int hojaFinReal = Math.min(ULTIMA_HOJA, totalHojas - 1);

            for (int i = PRIMERA_HOJA; i <= hojaFinReal; i++) {
                Sheet sheet = workbook.getSheetAt(i);
                if (sheet == null) continue;

                datos.addAll(procesarHoja(sheet));
            }
        } catch (Exception e) {
            throw new RuntimeException("Error procesando las celdas del Excel: " + e.getMessage());
        }

        return datos;
    }

    // Procesa una hoja individual: columnas A-G, desde la fila 3 hasta el último dato real
    // ... (resto de tu código arriba)

    // Procesa una hoja individual: columnas A-G, desde la fila 3 hasta el último dato real
    private List<RefaccionDto> procesarHoja(Sheet sheet) {
        List<RefaccionDto> filas = new ArrayList<>();
        int ultimaFilaConDatos = obtenerUltimaFilaConDatos(sheet);

        for (int r = FILA_INICIO; r <= ultimaFilaConDatos; r++) {
            Row row = sheet.getRow(r);
            if (row == null) continue;

            String ma = obtenerValorCelda(row.getCell(0));
            String fecha = obtenerValorCelda(row.getCell(1));
            String falla = obtenerValorCelda(row.getCell(2));
            String solucion = obtenerValorCelda(row.getCell(3));
            String proveedor = obtenerValorCelda(row.getCell(4));
            String costo = obtenerValorCelda(row.getCell(5));
            String refaccion = obtenerValorCelda(row.getCell(6));

            if (ma.isEmpty() && fecha.isEmpty() && falla.isEmpty() && solucion.isEmpty()
                    && proveedor.isEmpty() && costo.isEmpty() && refaccion.isEmpty()) {
                continue;
            }

            // NUEVO: Calcular el trimestre basado en la fecha
            String trimestre = calcularTrimestre(fecha);

            // ACTUALIZADO: Mandar el trimestre al DTO
            filas.add(new RefaccionDto(sheet.getSheetName(), ma, fecha, falla,
                    solucion, proveedor, costo, refaccion, trimestre));
        }

        return filas;
    }

    // NUEVO MÉTODO: Extrae el mes de la fecha y determina el Trimestre (Q1, Q2, Q3, Q4)
    private String calcularTrimestre(String fecha) {
        if (fecha == null || fecha.trim().isEmpty()) return "Sin fecha";

        try {
            // Como DateUtil.isCellDateFormatted devuelve "YYYY-MM-DD", buscamos este formato
            if (fecha.matches("\\d{4}-\\d{2}-\\d{2}")) {
                int mes = Integer.parseInt(fecha.substring(5, 7));
                return obtenerQ(mes);
            }
            // Por si el usuario lo ingresó como texto manual tipo "15/04/2023"
            if (fecha.contains("/")) {
                String[] partes = fecha.split("/");
                if (partes.length >= 2) {
                    int mes = Integer.parseInt(partes[1]);
                    return obtenerQ(mes);
                }
            }
        } catch (Exception e) {
            // Si hay error al parsear, devolvemos un valor por defecto
        }
        return "Desconocido";
    }

    private String obtenerQ(int mes) {
        if (mes >= 1 && mes <= 3) return "Q1";
        if (mes >= 4 && mes <= 6) return "Q2";
        if (mes >= 7 && mes <= 9) return "Q3";
        if (mes >= 10 && mes <= 12) return "Q4";
        return "Desconocido";
    }

    // ... (resto de tus métodos de ayuda, obtenerUltimaFilaConDatos, obtenerValorCelda)
    // Busca la última fila con algún dato real en el rango A-G, recorriendo desde el final
    private int obtenerUltimaFilaConDatos(Sheet sheet) {
        int lastRowNum = sheet.getLastRowNum();

        for (int r = lastRowNum; r >= FILA_INICIO; r--) {
            Row row = sheet.getRow(r);
            if (row == null) continue;

            for (int c = COL_INICIO; c <= COL_FIN; c++) {
                if (!obtenerValorCelda(row.getCell(c)).isEmpty()) {
                    return r;
                }
            }
        }
        return FILA_INICIO - 1; // no se encontraron datos
    }

    // Convierte cualquier tipo de celda a String de forma segura (texto, número, fecha, fórmula)
    private String obtenerValorCelda(Cell cell) {
        if (cell == null) return "";

        switch (cell.getCellType()) {
            case STRING:
                return cell.getStringCellValue().trim();
            case NUMERIC:
                if (DateUtil.isCellDateFormatted(cell)) {
                    return cell.getLocalDateTimeCellValue().toLocalDate().toString();
                }
                double num = cell.getNumericCellValue();
                if (num == Math.floor(num)) {
                    return String.valueOf((long) num);
                }
                return String.valueOf(num);
            case BOOLEAN:
                return String.valueOf(cell.getBooleanCellValue());
            case FORMULA:
                try {
                    return cell.getStringCellValue().trim();
                } catch (Exception e) {
                    try {
                        return String.valueOf(cell.getNumericCellValue());
                    } catch (Exception ex) {
                        return "";
                    }
                }
            default:
                return "";
        }
    }
}