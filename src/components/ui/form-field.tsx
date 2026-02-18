"use client"

// Usage:
// const form = useForm<z.infer<typeof schema>>({
//   resolver: zodResolver(schema),
//   mode: "onBlur",           // Errors appear on blur
//   reValidateMode: "onChange" // Errors clear in real-time
// });
//
// <Form {...form}>
//   <FormErrorSummary />
//   <FormInput name="email" label="Email">
//     <Input placeholder="you@example.com" />
//   </FormInput>
// </Form>

import * as React from "react"
import { useFormContext, useFormState } from "react-hook-form"
import { AlertCircle } from "lucide-react"

import { cn } from "@/lib/utils"
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormDescription,
} from "@/components/ui/form"

interface FormInputProps {
  name: string
  label: string
  description?: string
  children: React.ReactNode
  className?: string
}

const FormInput = React.forwardRef<HTMLDivElement, FormInputProps>(
  ({ name, label, description, children, className }, ref) => {
    const form = useFormContext()

    return (
      <FormField
        control={form.control}
        name={name}
        render={({ field }) => (
          <FormItem ref={ref} className={className}>
            <FormLabel>{label}</FormLabel>
            <FormControl>
              {React.isValidElement(children)
                ? React.cloneElement(children as React.ReactElement<any>, field)
                : children}
            </FormControl>
            {description && <FormDescription>{description}</FormDescription>}
            <FormMessage />
          </FormItem>
        )}
      />
    )
  }
)
FormInput.displayName = "FormInput"

interface FormErrorSummaryProps {
  className?: string
}

const FormErrorSummary = React.forwardRef<HTMLDivElement, FormErrorSummaryProps>(
  ({ className }, ref) => {
    const { errors } = useFormState()
    const errorCount = Object.keys(errors).length

    if (errorCount === 0) {
      return null
    }

    return (
      <div
        ref={ref}
        className={cn(
          "flex items-center gap-2 rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-destructive",
          className
        )}
      >
        <AlertCircle className="h-4 w-4 shrink-0" />
        <p className="text-sm font-medium">
          {errorCount} {errorCount === 1 ? "field" : "fields"} need{errorCount === 1 ? "s" : ""} attention
        </p>
      </div>
    )
  }
)
FormErrorSummary.displayName = "FormErrorSummary"

export { FormInput, FormErrorSummary }
