export interface Customer {
  id: string;
  user_id: string;
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  created_at: string;
}

export interface Vehicle {
  id: string;
  customer_id: string;
  user_id: string;
  make: string;
  model: string;
  year?: number;
  license_plate?: string;
  vin?: string;
  mileage?: number;
  created_at: string;
}

export interface RepairBase {
  id: string;
  vehicle_id: string;
  user_id: string;
  description: string;
  status: "pending" | "in_progress" | "diagnosed" | "waiting_parts" | "completed" | "invoiced";
  estimated_cost?: number;
  actual_cost?: number;
  due_date?: string | null;
  completed_at?: string | null;
  notes?: string;
  created_at: string;
}

export interface JoinedRepair extends RepairBase {
  vehicle: {
    id: string;
    make: string;
    model: string;
    license_plate?: string;
    customer: Pick<Customer, 'name'> | null;
  } | null;
}