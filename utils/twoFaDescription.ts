import { maskEmail, maskPhoneNumber } from '@/utils/mask'

export type TwoFaDestinations = {
  emails: string[]
  phones: string[]
}

/** Đích nhận mã 2FA đã mask — bỏ trùng email và số điện thoại */
export function buildTwoFaDestinations(
  email: string,
  phone: string,
  emailBusiness?: string,
  phoneBackup?: string
): TwoFaDestinations {
  const emails: string[] = []
  const phones: string[] = []
  const contact = email.trim()
  const business = (emailBusiness ?? '').trim()
  const contactLower = contact.toLowerCase()
  const businessLower = business.toLowerCase()
  const phoneDigits = phone.replace(/\D/g, '')
  const backupDigits = (phoneBackup ?? '').replace(/\D/g, '')

  if (contact) emails.push(maskEmail(contact))
  if (business && businessLower !== contactLower) emails.push(maskEmail(business))
  if (phoneDigits) phones.push(maskPhoneNumber(phoneDigits))
  if (backupDigits && backupDigits !== phoneDigits) phones.push(maskPhoneNumber(backupDigits))

  return { emails, phones }
}
