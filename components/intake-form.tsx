"use client"

import type React from "react"
import { useId, useMemo, useState } from "react"
import { intakeFormSchema } from "@/lib/validation"
import { z } from "zod"

interface FormState {
  full_name: string
  phone: string
  email: string
  consent: boolean
}

interface Errors {
  full_name?: string
  phone?: string
  email?: string
  consent?: string
}

export default function IntakeForm({
  onSubmitted,
}: {
  onSubmitted?: () => void
}) {
  const idPrefix = useId()
  const [form, setForm] = useState<FormState>({
    full_name: "",
    phone: "",
    email: "",
    consent: false,
  })
  const [errors, setErrors] = useState<Errors>({})

  function validate(next: FormState): Errors {
    const e: Errors = {}
    
    try {
      intakeFormSchema.parse(next)
    } catch (error) {
      if (error instanceof z.ZodError) {
        error.errors.forEach((err) => {
          const field = err.path[0] as keyof FormState
          if (field) {
            e[field] = err.message
          }
        })
      }
    }
    
    return e
  }

  const isValid = useMemo(() => Object.keys(validate(form)).length === 0, [form])

  function onChange<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => {
      const next = { ...f, [key]: value }
      const e = validate(next)
      setErrors(e)
      return next
    })
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const eMap = validate(form)
    setErrors(eMap)
    if (Object.keys(eMap).length > 0) return
    // No persistence; just simulate a completed submission
    onSubmitted?.()
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm sm:p-5"
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label htmlFor={`${idPrefix}-full_name`} className="block text-sm font-medium text-gray-800">
            Full name
          </label>
          <input
            id={`${idPrefix}-full_name`}
            type="text"
            value={form.full_name}
            onChange={(e) => onChange("full_name", e.target.value)}
            className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
          />
          {errors.full_name && <p className="mt-1 text-xs text-red-600">{errors.full_name}</p>}
        </div>

        <div>
          <label htmlFor={`${idPrefix}-email`} className="block text-sm font-medium text-gray-800">
            Email
          </label>
          <input
            id={`${idPrefix}-email`}
            type="email"
            value={form.email ?? ""}
            onChange={(e) => onChange("email", e.target.value)}
            className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
          />
          {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
        </div>

        <div>
          <label htmlFor={`${idPrefix}-phone`} className="block text-sm font-medium text-gray-800">
            Phone (optional)
          </label>
          <input
            id={`${idPrefix}-phone`}
            type="tel"
            value={form.phone ?? ""}
            onChange={(e) => onChange("phone", e.target.value)}
            className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
          />
          {errors.phone && <p className="mt-1 text-xs text-red-600">{errors.phone}</p>}
        </div>

        <div className="sm:col-span-2">
          <div className="flex items-start gap-2">
            <input
              id={`${idPrefix}-consent`}
              type="checkbox"
              checked={form.consent}
              onChange={(e) => onChange("consent", e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-gray-300 text-gray-900 focus:ring-gray-900"
            />
            <div>
              <label htmlFor={`${idPrefix}-consent`} className="text-sm font-medium text-gray-800">
                Consent
              </label>
              <p className="text-xs text-gray-600">
                I agree to participate in training sessions and understand the risks involved. I consent to being
                contacted by Your Organization regarding scheduling, updates, and payments.
              </p>
              {errors.consent && <p className="mt-1 text-xs text-red-600">{errors.consent}</p>}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 flex justify-end">
        <button
          type="submit"
          className="inline-flex h-9 items-center justify-center rounded-md bg-gray-900 px-4 text-sm font-medium text-white hover:bg-black disabled:opacity-50"
          disabled={!isValid}
        >
          Submit
        </button>
      </div>
    </form>
  )
}
