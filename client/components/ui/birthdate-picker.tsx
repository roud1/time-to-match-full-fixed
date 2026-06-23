"use client"

import { useEffect, useMemo, useState } from "react"
import { de, enUS, es, fr, it, pl, ru, tr, uk } from "date-fns/locale"
import { CalendarIcon } from "lucide-react"
import { Calendar } from "@/client/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/client/components/ui/popover"
import { useI18n, type Locale } from "@/client/lib/i18n"
import {
  formatBirthdateDigits,
  getAgeFromIsoDate,
  getBirthdateBounds,
  getBirthdateInputOrder,
  isoToDisplayText,
  isWithinBirthdateBounds,
  parseIsoDate,
  parseManualBirthdate,
  toIsoDate,
} from "@/client/lib/birthdate"
import { cn } from "@/client/lib/utils"
import "@/app/birthdate-picker.css"

const DATE_FNS_LOCALES: Record<Locale, typeof ru> = {
  ru,
  uk,
  en: enUS,
  de,
  es,
  pl,
  fr,
  it,
  tr,
}

type BirthdatePickerProps = {
  value: string
  onChange: (iso: string) => void
  id?: string
  disabled?: boolean
  "aria-invalid"?: boolean
  className?: string
}

export function BirthdatePicker({
  value,
  onChange,
  id,
  disabled,
  "aria-invalid": ariaInvalid,
  className,
}: BirthdatePickerProps) {
  const { t, locale } = useI18n()
  const [open, setOpen] = useState(false)
  const [text, setText] = useState("")
  const [inputInvalid, setInputInvalid] = useState(false)
  const [viewMonth, setViewMonth] = useState<Date | undefined>(undefined)

  const { minDate, maxDate } = useMemo(() => getBirthdateBounds(), [])
  const dateFnsLocale = DATE_FNS_LOCALES[locale] ?? ru
  const order = getBirthdateInputOrder(locale)

  const selected = parseIsoDate(value)
  const age = value ? getAgeFromIsoDate(value) : null
  const ageHint =
    age != null ? t("birthdateAgeHint").replace("{age}", String(age)) : null

  useEffect(() => {
    setText(value ? isoToDisplayText(value, order) : "")
    setInputInvalid(false)
    const parsed = parseIsoDate(value)
    if (parsed) setViewMonth(parsed)
  }, [value, order])

  const commitText = (raw: string, opts?: { clearOnFail?: boolean }) => {
    const trimmed = raw.trim()
    if (!trimmed) {
      onChange("")
      setText("")
      setInputInvalid(false)
      return true
    }

    const parsed = parseManualBirthdate(trimmed, order)
    if (!parsed || !isWithinBirthdateBounds(parsed, minDate, maxDate)) {
      setInputInvalid(true)
      if (opts?.clearOnFail) {
        onChange("")
      }
      return false
    }

    const iso = toIsoDate(parsed)
    onChange(iso)
    setText(isoToDisplayText(iso, order))
    setInputInvalid(false)
    setViewMonth(parsed)
    return true
  }

  const handleInputChange = (raw: string) => {
    const digits = raw.replace(/\D/g, "")
    const formatted = formatBirthdateDigits(digits, order)
    setText(formatted)
    setInputInvalid(false)

    if (digits.length === 8) {
      commitText(formatted)
    } else if (value) {
      onChange("")
    }
  }

  return (
    <div className={cn("ttm-birthdate-picker", className)}>
      <div className="ttm-birthdate-picker__row">
        <input
          id={id}
          type="text"
          inputMode="numeric"
          autoComplete="bday"
          disabled={disabled}
          aria-invalid={ariaInvalid || inputInvalid}
          placeholder={t("birthdateInputPlaceholder")}
          value={text}
          onChange={(e) => handleInputChange(e.target.value)}
          onBlur={() => {
            if (!text.trim()) {
              onChange("")
              setInputInvalid(false)
              return
            }
            if (!commitText(text)) {
              setText(value ? isoToDisplayText(value, order) : "")
            }
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault()
              commitText(text, { clearOnFail: false })
            }
          }}
          className={cn(
            "ttm-birthdate-picker__input ttm-input",
            inputInvalid && "ttm-birthdate-picker__input--invalid"
          )}
        />
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <button
              type="button"
              disabled={disabled}
              aria-label={t("birthdateOpenCalendar")}
              className="ttm-birthdate-picker__cal-btn"
            >
              <CalendarIcon className="ttm-birthdate-picker__icon" aria-hidden />
            </button>
          </PopoverTrigger>
          <PopoverContent
            align="end"
            sideOffset={6}
            className="ttm-birthdate-picker__popover w-auto p-0"
          >
            <Calendar
              mode="single"
              selected={selected}
              month={viewMonth ?? selected ?? maxDate}
              onMonthChange={setViewMonth}
              onSelect={(date) => {
                if (!date) return
                const iso = toIsoDate(date)
                onChange(iso)
                setText(isoToDisplayText(iso, order))
                setInputInvalid(false)
                setViewMonth(date)
                setOpen(false)
              }}
              captionLayout="dropdown"
              reverseYears
              startMonth={minDate}
              endMonth={maxDate}
              disabled={[{ after: maxDate }, { before: minDate }]}
              locale={dateFnsLocale}
              className="ttm-birthdate-picker__calendar"
              classNames={{
                dropdown_root: "ttm-birthdate-picker__dropdown",
              }}
            />
          </PopoverContent>
        </Popover>
      </div>
      {inputInvalid ? (
        <p className="ttm-birthdate-picker__error" role="alert">
          {t("birthdateInvalidFormat")}
        </p>
      ) : ageHint ? (
        <p className="ttm-birthdate-picker__hint" aria-live="polite">
          {ageHint}
        </p>
      ) : null}
    </div>
  )
}
