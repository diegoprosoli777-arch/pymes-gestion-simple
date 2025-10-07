export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      clientes: {
        Row: {
          created_at: string
          email: string | null
          empresa: string | null
          estado: string
          id: string
          nombre: string
          notas: string | null
          telefono: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          email?: string | null
          empresa?: string | null
          estado?: string
          id?: string
          nombre: string
          notas?: string | null
          telefono?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          email?: string | null
          empresa?: string | null
          estado?: string
          id?: string
          nombre?: string
          notas?: string | null
          telefono?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      compras_proveedores: {
        Row: {
          concepto: string
          created_at: string
          estado: string
          fecha: string
          fecha_pago: string | null
          fecha_vencimiento: string | null
          id: string
          metodo_pago: string | null
          monto_total: number
          notas: string | null
          numero_factura: string | null
          proveedor_id: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          concepto: string
          created_at?: string
          estado?: string
          fecha?: string
          fecha_pago?: string | null
          fecha_vencimiento?: string | null
          id?: string
          metodo_pago?: string | null
          monto_total?: number
          notas?: string | null
          numero_factura?: string | null
          proveedor_id: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          concepto?: string
          created_at?: string
          estado?: string
          fecha?: string
          fecha_pago?: string | null
          fecha_vencimiento?: string | null
          id?: string
          metodo_pago?: string | null
          monto_total?: number
          notas?: string | null
          numero_factura?: string | null
          proveedor_id?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "compras_proveedores_proveedor_id_fkey"
            columns: ["proveedor_id"]
            isOneToOne: false
            referencedRelation: "proveedores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_compras_proveedor"
            columns: ["proveedor_id"]
            isOneToOne: false
            referencedRelation: "proveedores"
            referencedColumns: ["id"]
          },
        ]
      }
      gastos: {
        Row: {
          categoria_fiscal: string | null
          created_at: string
          fecha: string
          id: string
          monto: number
          notas: string | null
          proveedor: string
          tipo: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          categoria_fiscal?: string | null
          created_at?: string
          fecha?: string
          id?: string
          monto?: number
          notas?: string | null
          proveedor: string
          tipo?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          categoria_fiscal?: string | null
          created_at?: string
          fecha?: string
          id?: string
          monto?: number
          notas?: string | null
          proveedor?: string
          tipo?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      interacciones_clientes: {
        Row: {
          cliente_id: string | null
          created_at: string
          descripcion: string | null
          fecha: string | null
          id: string
          tipo: string
          titulo: string
          user_id: string | null
        }
        Insert: {
          cliente_id?: string | null
          created_at?: string
          descripcion?: string | null
          fecha?: string | null
          id?: string
          tipo: string
          titulo: string
          user_id?: string | null
        }
        Update: {
          cliente_id?: string | null
          created_at?: string
          descripcion?: string | null
          fecha?: string | null
          id?: string
          tipo?: string
          titulo?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "interacciones_clientes_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
        ]
      }
      pagos_proveedores: {
        Row: {
          compra_id: string | null
          concepto: string | null
          created_at: string
          fecha: string
          id: string
          metodo_pago: string
          monto: number
          notas: string | null
          numero_referencia: string | null
          proveedor_id: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          compra_id?: string | null
          concepto?: string | null
          created_at?: string
          fecha?: string
          id?: string
          metodo_pago?: string
          monto?: number
          notas?: string | null
          numero_referencia?: string | null
          proveedor_id: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          compra_id?: string | null
          concepto?: string | null
          created_at?: string
          fecha?: string
          id?: string
          metodo_pago?: string
          monto?: number
          notas?: string | null
          numero_referencia?: string | null
          proveedor_id?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_pagos_compra"
            columns: ["compra_id"]
            isOneToOne: false
            referencedRelation: "compras_proveedores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_pagos_proveedor"
            columns: ["proveedor_id"]
            isOneToOne: false
            referencedRelation: "proveedores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pagos_proveedores_compra_id_fkey"
            columns: ["compra_id"]
            isOneToOne: false
            referencedRelation: "compras_proveedores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pagos_proveedores_proveedor_id_fkey"
            columns: ["proveedor_id"]
            isOneToOne: false
            referencedRelation: "proveedores"
            referencedColumns: ["id"]
          },
        ]
      }
      pipeline_clientes: {
        Row: {
          cliente_id: string | null
          created_at: string
          estado: string
          fecha_cambio_estado: string | null
          id: string
          notas: string | null
          probabilidad: number | null
          updated_at: string
          user_id: string | null
          valor_estimado: number | null
        }
        Insert: {
          cliente_id?: string | null
          created_at?: string
          estado?: string
          fecha_cambio_estado?: string | null
          id?: string
          notas?: string | null
          probabilidad?: number | null
          updated_at?: string
          user_id?: string | null
          valor_estimado?: number | null
        }
        Update: {
          cliente_id?: string | null
          created_at?: string
          estado?: string
          fecha_cambio_estado?: string | null
          id?: string
          notas?: string | null
          probabilidad?: number | null
          updated_at?: string
          user_id?: string | null
          valor_estimado?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "pipeline_clientes_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
        ]
      }
      presupuestos_mensuales: {
        Row: {
          año: number
          created_at: string
          gastos_esperados: number | null
          id: string
          ingresos_esperados: number | null
          mes: number
          notas: string | null
          objetivo_ventas: number | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          año: number
          created_at?: string
          gastos_esperados?: number | null
          id?: string
          ingresos_esperados?: number | null
          mes: number
          notas?: string | null
          objetivo_ventas?: number | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          año?: number
          created_at?: string
          gastos_esperados?: number | null
          id?: string
          ingresos_esperados?: number | null
          mes?: number
          notas?: string | null
          objetivo_ventas?: number | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      productos: {
        Row: {
          categoria: string
          costo: number
          created_at: string
          id: string
          nombre: string
          precio: number
          stock_actual: number
          stock_minimo: number
          updated_at: string
          user_id: string | null
        }
        Insert: {
          categoria?: string
          costo?: number
          created_at?: string
          id?: string
          nombre: string
          precio?: number
          stock_actual?: number
          stock_minimo?: number
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          categoria?: string
          costo?: number
          created_at?: string
          id?: string
          nombre?: string
          precio?: number
          stock_actual?: number
          stock_minimo?: number
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      proveedores: {
        Row: {
          activo: boolean | null
          calle: string | null
          ciudad: string | null
          codigo_postal: string | null
          created_at: string
          cuit_dni: string | null
          direccion: string | null
          email: string | null
          empresa: string | null
          especialidad: string | null
          id: string
          nombre: string
          notas: string | null
          notas_internas: string | null
          numero: string | null
          provincia: string | null
          rubro: string | null
          telefono: string | null
          tipo_proveedor: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          activo?: boolean | null
          calle?: string | null
          ciudad?: string | null
          codigo_postal?: string | null
          created_at?: string
          cuit_dni?: string | null
          direccion?: string | null
          email?: string | null
          empresa?: string | null
          especialidad?: string | null
          id?: string
          nombre: string
          notas?: string | null
          notas_internas?: string | null
          numero?: string | null
          provincia?: string | null
          rubro?: string | null
          telefono?: string | null
          tipo_proveedor?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          activo?: boolean | null
          calle?: string | null
          ciudad?: string | null
          codigo_postal?: string | null
          created_at?: string
          cuit_dni?: string | null
          direccion?: string | null
          email?: string | null
          empresa?: string | null
          especialidad?: string | null
          id?: string
          nombre?: string
          notas?: string | null
          notas_internas?: string | null
          numero?: string | null
          provincia?: string | null
          rubro?: string | null
          telefono?: string | null
          tipo_proveedor?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      tareas_clientes: {
        Row: {
          cliente_id: string | null
          completada: boolean | null
          created_at: string
          descripcion: string | null
          fecha_completado: string | null
          fecha_vencimiento: string | null
          id: string
          prioridad: string | null
          tipo: string
          titulo: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          cliente_id?: string | null
          completada?: boolean | null
          created_at?: string
          descripcion?: string | null
          fecha_completado?: string | null
          fecha_vencimiento?: string | null
          id?: string
          prioridad?: string | null
          tipo?: string
          titulo: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          cliente_id?: string | null
          completada?: boolean | null
          created_at?: string
          descripcion?: string | null
          fecha_completado?: string | null
          fecha_vencimiento?: string | null
          id?: string
          prioridad?: string | null
          tipo?: string
          titulo?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tareas_clientes_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
        ]
      }
      vencimientos_impositivos: {
        Row: {
          completado: boolean | null
          created_at: string
          descripcion: string | null
          fecha_completado: string | null
          fecha_vencimiento: string
          id: string
          monto_estimado: number | null
          nombre: string
          notas: string | null
          tipo: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          completado?: boolean | null
          created_at?: string
          descripcion?: string | null
          fecha_completado?: string | null
          fecha_vencimiento: string
          id?: string
          monto_estimado?: number | null
          nombre: string
          notas?: string | null
          tipo?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          completado?: boolean | null
          created_at?: string
          descripcion?: string | null
          fecha_completado?: string | null
          fecha_vencimiento?: string
          id?: string
          monto_estimado?: number | null
          nombre?: string
          notas?: string | null
          tipo?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      ventas: {
        Row: {
          cliente_id: string | null
          created_at: string
          descuento: number | null
          estado: string
          fecha: string
          fecha_cobro: string | null
          fecha_vencimiento: string | null
          id: string
          impuesto: number | null
          metodo_pago: string
          monto_total: number
          updated_at: string
          user_id: string | null
        }
        Insert: {
          cliente_id?: string | null
          created_at?: string
          descuento?: number | null
          estado?: string
          fecha?: string
          fecha_cobro?: string | null
          fecha_vencimiento?: string | null
          id?: string
          impuesto?: number | null
          metodo_pago?: string
          monto_total?: number
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          cliente_id?: string | null
          created_at?: string
          descuento?: number | null
          estado?: string
          fecha?: string
          fecha_cobro?: string | null
          fecha_vencimiento?: string | null
          id?: string
          impuesto?: number | null
          metodo_pago?: string
          monto_total?: number
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ventas_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
        ]
      }
      ventas_items: {
        Row: {
          cantidad: number
          created_at: string
          id: string
          precio_unitario: number
          producto_id: string
          venta_id: string
        }
        Insert: {
          cantidad?: number
          created_at?: string
          id?: string
          precio_unitario?: number
          producto_id: string
          venta_id: string
        }
        Update: {
          cantidad?: number
          created_at?: string
          id?: string
          precio_unitario?: number
          producto_id?: string
          venta_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ventas_items_producto_id_fkey"
            columns: ["producto_id"]
            isOneToOne: false
            referencedRelation: "productos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ventas_items_venta_id_fkey"
            columns: ["venta_id"]
            isOneToOne: false
            referencedRelation: "ventas"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
