/**
 * Convert a number to a DER length.
 *
 * @param n - The number to convert.
 * @returns
 * @since 1.0.0
 * @author Caique Araujo <caique@piggly.com.br>
 */
export const derLen = (n: number): Buffer => {
	if (n < 0x80) {
		return Buffer.from([n]);
	}

	const hex = n.toString(16);
	const bytes = Buffer.from(hex.length % 2 ? '0' + hex : hex, 'hex');

	return Buffer.concat([Buffer.from([0x80 | bytes.length]), bytes]);
};

/**
 * Convert a DER buffer to a tag.
 *
 * @param tag - The tag to convert.
 * @param content - The content to convert.
 * @returns
 * @since 1.0.0
 * @author Caique Araujo <caique@piggly.com.br>
 */
export const derTag = (tag: number, content: Buffer): Buffer => {
	return Buffer.concat([Buffer.from([tag]), derLen(content.length), content]);
};

/**
 * Convert a DER buffer to a sequence.
 *
 * @param parts - The parts to convert.
 * @returns
 * @since 1.0.0
 * @author Caique Araujo <caique@piggly.com.br>
 */
export const derSeq = (...parts: Buffer[]): Buffer => {
	return derTag(0x30, Buffer.concat(parts));
};

/**
 * Convert a DER buffer to a OID Ed25519.
 *
 * @returns
 * @since 1.0.0
 * @author Caique Araujo <caique@piggly.com.br>
 */
export const derOidEd25519 = (): Buffer => {
	return derTag(0x06, Buffer.from([0x2b, 0x65, 0x70]));
};

/**
 * Convert a DER buffer to a null.
 *
 * @returns
 * @since 1.0.0
 * @author Caique Araujo <caique@piggly.com.br>
 */
export const derNull = (): Buffer => {
	return derTag(0x05, Buffer.alloc(0));
};

/**
 * Convert a DER buffer to a integer zero.
 *
 * @returns
 * @since 1.0.0
 * @author Caique Araujo <caique@piggly.com.br>
 */
export const derIntZero = (): Buffer => {
	return derTag(0x02, Buffer.from([0x00]));
};

/**
 * Convert a DER buffer to a octet string.
 *
 * @param bytes - The bytes to convert.
 * @returns
 * @since 1.0.0
 * @author Caique Araujo <caique@piggly.com.br>
 */
export const derOctetString = (bytes: Buffer): Buffer => {
	return derTag(0x04, bytes);
};

/**
 * Convert a DER buffer to a bit string.
 *
 * @param bytes - The bytes to convert.
 * @returns
 * @since 1.0.0
 * @author Caique Araujo <caique@piggly.com.br>
 */
export const derBitString = (bytes: Buffer): Buffer => {
	return derTag(0x03, Buffer.concat([Buffer.from([0x00]), bytes]));
};

/**
 * Convert a DER buffer to a context 1 bit string.
 *
 * @param bytes - The bytes to convert.
 * @returns
 * @since 1.0.0
 * @author Caique Araujo <caique@piggly.com.br>
 */
export const derContext1BitString = (bytes: Buffer): Buffer => {
	const content = Buffer.concat([Buffer.from([0x00]), bytes]);
	return derTag(0xa1, content);
};

/**
 * Convert a DER buffer to a PEM string.
 *
 * @param type - The type of the PEM.
 * @param der - The DER buffer to convert.
 * @returns The PEM string.
 * @since 1.0.0
 * @author Caique Araujo <caique@piggly.com.br>
 */
export const toPem = (type: string, der: Buffer): string => {
	const b64 = der.toString('base64');
	const lines = b64.match(/.{1,64}/g) ?? [];
	return `-----BEGIN ${type}-----\n${lines.join('\n')}\n-----END ${type}-----\n`;
};
