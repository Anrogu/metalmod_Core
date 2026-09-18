package com.metalmod.core.Dto;

public class RefaccionDto {
    private String hoja;
    private String ma;
    private String fecha;
    private String falla;
    private String solucion;
    private String proveedor;
    private String costo;
    private String refaccion;
    private String trimestre; // NUEVO CAMPO

    public RefaccionDto() {}

    public RefaccionDto(String hoja, String ma, String fecha, String falla,
                        String solucion, String proveedor, String costo,
                        String refaccion, String trimestre) { // SE AGREGÓ AL CONSTRUCTOR
        this.hoja = hoja;
        this.ma = ma;
        this.fecha = fecha;
        this.falla = falla;
        this.solucion = solucion;
        this.proveedor = proveedor;
        this.costo = costo;
        this.refaccion = refaccion;
        this.trimestre = trimestre;
    }

    // Getters y setters
    public String getHoja() { return hoja; }
    public void setHoja(String hoja) { this.hoja = hoja; }

    public String getMa() { return ma; }
    public void setMa(String ma) { this.ma = ma; }

    public String getFecha() { return fecha; }
    public void setFecha(String fecha) { this.fecha = fecha; }

    public String getFalla() { return falla; }
    public void setFalla(String falla) { this.falla = falla; }

    public String getSolucion() { return solucion; }
    public void setSolucion(String solucion) { this.solucion = solucion; }

    public String getProveedor() { return proveedor; }
    public void setProveedor(String proveedor) { this.proveedor = proveedor; }

    public String getCosto() { return costo; }
    public void setCosto(String costo) { this.costo = costo; }

    public String getRefaccion() { return refaccion; }
    public void setRefaccion(String refaccion) { this.refaccion = refaccion; }

    // NUEVOS GETTER Y SETTER PARA EL TRIMESTRE
    public String getTrimestre() { return trimestre; }
    public void setTrimestre(String trimestre) { this.trimestre = trimestre; }
}