import type { ADMIN_EMAILS } from '../lib/constants';

export type AdminEmail = (typeof ADMIN_EMAILS)[number];
