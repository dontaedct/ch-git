import { splitName } from "@/lib/utils/splitName";

export type IntakeInsert = { 
  first_name: string; 
  last_name: string|null; 
  phone?: string|null; 
  email?: string|null; 
  consent: boolean 
};

export function toIntakeInsert(form: { name: string; phone?: string | null | undefined; email?: string | null | undefined; consent: boolean }): IntakeInsert {
  return {
    ...splitName(form.name),
    phone: form.phone ?? null,
    email: form.email ?? null,
    consent: form.consent
  };
}
