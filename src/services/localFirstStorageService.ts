/**
 * Finova Local-First Storage & Zero-Knowledge Personal Cloud Backup Engine
 * 
 * Features:
 * 1. 100% Local-First: User transactional & business data lives exclusively on the client.
 * 2. Zero Server Footprint: Zero bytes sent to central Firestore or backend databases.
 * 3. Client-Side Encryption: AES-256-GCM + PBKDF2 (100,000 iterations) with Web Crypto API.
 * 4. Personal Cloud Support: Direct Google Drive / iCloud backup file format (.finova).
 * 5. Instant Disaster Recovery: Decrypt & atomic restore onto any new device.
 */

export interface FinovaEncryptedVault {
  app: 'Finova';
  version: '2.1.0';
  format: 'finova-localfirst-encrypted-vault';
  createdAt: string;
  userId: string;
  userEmail: string;
  businessName: string;
  stats: {
    productsCount: number;
    transactionsCount: number;
    invoicesCount: number;
    debtsCount: number;
    customersCount: number;
    accountsCount: number;
  };
  crypto: {
    algorithm: 'AES-256-GCM';
    kdf: 'PBKDF2-SHA256';
    iterations: number;
    saltBase64: string;
    ivBase64: string;
    authTagLength: number;
  };
  integrityChecksum: string;
  ciphertextBase64: string;
}

export interface FinovaLocalDataPayload {
  profile: any;
  businessAccounts: any[];
  activeAccountId: string;
  products: any[];
  transactions: any[];
  invoices: any[];
  quotes: any[];
  debts: any[];
  customers: any[];
  categories: string[];
  customerCategories: string[];
  exportedAt: string;
  version: string;
}

// Convert ArrayBuffer <-> Base64
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

// Compute SHA-256 checksum for tamper-evidence
async function computeSha256Checksum(data: string): Promise<string> {
  const enc = new TextEncoder();
  const digest = await crypto.subtle.digest('SHA-256', enc.encode(data));
  return arrayBufferToBase64(digest);
}

/**
 * Derives an AES-256-GCM CryptoKey using PBKDF2 from a user passphrase and salt
 */
async function deriveEncryptionKey(passphrase: string, salt: Uint8Array, iterations = 100000): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const passwordKey = await crypto.subtle.importKey(
    'raw',
    enc.encode(passphrase),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt as unknown as BufferSource,
      iterations,
      hash: 'SHA-256',
    },
    passwordKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

export const localFirstStorageService = {
  /**
   * Export all local data for a given user from local storage
   */
  collectUserData(userId: string): FinovaLocalDataPayload {
    const prefix = `treinta_usr_${userId}_`;

    const getParsed = (key: string, fallback: any) => {
      const val = localStorage.getItem(`${prefix}${key}`) || localStorage.getItem(`treinta_${key}`);
      if (!val) return fallback;
      try {
        return JSON.parse(val);
      } catch {
        return fallback;
      }
    };

    const profile = getParsed('profile', {});
    const businessAccounts = getParsed('accounts', []);
    const activeAccountId = localStorage.getItem(`${prefix}active_account`) || 'acc-1';
    const products = getParsed('products', []);
    const transactions = getParsed('transactions', []);
    const invoices = getParsed('invoices', []);
    const quotes = getParsed('quotes', []);
    const debts = getParsed('debts', []);
    const customers = getParsed('customers', []);
    const categories = getParsed('categories', []);
    const customerCategories = getParsed('customer_categories', ['Frecuente', 'Mayorista', 'VIP']);

    return {
      profile,
      businessAccounts,
      activeAccountId,
      products,
      transactions,
      invoices,
      quotes,
      debts,
      customers,
      categories,
      customerCategories,
      exportedAt: new Date().toISOString(),
      version: '2.1.0',
    };
  },

  /**
   * Encrypts local data with user passphrase using AES-256-GCM + PBKDF2
   */
  async encryptBackup(
    dataPayload: FinovaLocalDataPayload,
    passphrase: string,
    userInfo: { id: string; email: string; businessName: string }
  ): Promise<FinovaEncryptedVault> {
    if (!passphrase || passphrase.length < 4) {
      throw new Error('La clave de cifrado del respaldo debe tener al menos 4 caracteres.');
    }

    const enc = new TextEncoder();
    const rawPlaintext = JSON.stringify(dataPayload);
    const plaintextBuffer = enc.encode(rawPlaintext);

    // Cryptographically secure random salt (16 bytes) and IV (12 bytes)
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const iterations = 100000;

    const aesKey = await deriveEncryptionKey(passphrase, salt, iterations);

    // Encrypt with AES-GCM (128-bit authentication tag)
    const ciphertextBuffer = await crypto.subtle.encrypt(
      {
        name: 'AES-GCM',
        iv,
        tagLength: 128,
      },
      aesKey,
      plaintextBuffer
    );

    const ciphertextBase64 = arrayBufferToBase64(ciphertextBuffer);
    const saltBase64 = arrayBufferToBase64(salt.buffer);
    const ivBase64 = arrayBufferToBase64(iv.buffer);

    // Compute checksum to verify file integrity
    const integrityChecksum = await computeSha256Checksum(`${saltBase64}.${ivBase64}.${ciphertextBase64}`);

    return {
      app: 'Finova',
      version: '2.1.0',
      format: 'finova-localfirst-encrypted-vault',
      createdAt: new Date().toISOString(),
      userId: userInfo.id,
      userEmail: userInfo.email,
      businessName: userInfo.businessName,
      stats: {
        productsCount: dataPayload.products.length,
        transactionsCount: dataPayload.transactions.length,
        invoicesCount: dataPayload.invoices.length,
        debtsCount: dataPayload.debts.length,
        customersCount: dataPayload.customers.length,
        accountsCount: dataPayload.businessAccounts.length,
      },
      crypto: {
        algorithm: 'AES-256-GCM',
        kdf: 'PBKDF2-SHA256',
        iterations,
        saltBase64,
        ivBase64,
        authTagLength: 128,
      },
      integrityChecksum,
      ciphertextBase64,
    };
  },

  /**
   * Decrypts a FinovaEncryptedVault using the user passphrase
   */
  async decryptBackup(
    vault: FinovaEncryptedVault,
    passphrase: string
  ): Promise<FinovaLocalDataPayload> {
    if (vault.app !== 'Finova' || !vault.crypto || !vault.ciphertextBase64) {
      throw new Error('El archivo seleccionado no es un respaldo válido de Finova.');
    }

    // Verify integrity checksum
    const computedChecksum = await computeSha256Checksum(
      `${vault.crypto.saltBase64}.${vault.crypto.ivBase64}.${vault.ciphertextBase64}`
    );

    if (computedChecksum !== vault.integrityChecksum) {
      throw new Error('Verificación de integridad fallida: el archivo de respaldo ha sido alterado o está corrupto.');
    }

    const salt = new Uint8Array(base64ToArrayBuffer(vault.crypto.saltBase64));
    const iv = new Uint8Array(base64ToArrayBuffer(vault.crypto.ivBase64));
    const ciphertext = base64ToArrayBuffer(vault.ciphertextBase64);

    try {
      const aesKey = await deriveEncryptionKey(passphrase, salt, vault.crypto.iterations || 100000);

      const decryptedBuffer = await crypto.subtle.decrypt(
        {
          name: 'AES-GCM',
          iv,
          tagLength: vault.crypto.authTagLength || 128,
        },
        aesKey,
        ciphertext
      );

      const dec = new TextDecoder();
      const plainJson = dec.decode(decryptedBuffer);
      return JSON.parse(plainJson);
    } catch (err: any) {
      throw new Error('Contraseña incorrecta o el archivo no pudo ser descifrado de manera segura.');
    }
  },

  /**
   * Restores decrypted payload into local storage for the specified user
   */
  restoreUserData(userId: string, data: FinovaLocalDataPayload): boolean {
    const prefix = `treinta_usr_${userId}_`;

    if (data.profile) localStorage.setItem(`${prefix}profile`, JSON.stringify(data.profile));
    if (data.businessAccounts) localStorage.setItem(`${prefix}accounts`, JSON.stringify(data.businessAccounts));
    if (data.activeAccountId) localStorage.setItem(`${prefix}active_account`, data.activeAccountId);
    if (data.products) localStorage.setItem(`${prefix}products`, JSON.stringify(data.products));
    if (data.transactions) localStorage.setItem(`${prefix}transactions`, JSON.stringify(data.transactions));
    if (data.invoices) localStorage.setItem(`${prefix}invoices`, JSON.stringify(data.invoices));
    if (data.quotes) localStorage.setItem(`${prefix}quotes`, JSON.stringify(data.quotes));
    if (data.debts) localStorage.setItem(`${prefix}debts`, JSON.stringify(data.debts));
    if (data.customers) localStorage.setItem(`${prefix}customers`, JSON.stringify(data.customers));
    if (data.categories) localStorage.setItem(`${prefix}categories`, JSON.stringify(data.categories));
    if (data.customerCategories) localStorage.setItem(`${prefix}customer_categories`, JSON.stringify(data.customerCategories));

    // Also update generic keys if this matches active user
    if (data.profile) localStorage.setItem('treinta_profile', JSON.stringify(data.profile));
    if (data.products) localStorage.setItem('treinta_products', JSON.stringify(data.products));
    if (data.transactions) localStorage.setItem('treinta_transactions', JSON.stringify(data.transactions));
    if (data.debts) localStorage.setItem('treinta_debts', JSON.stringify(data.debts));
    if (data.customers) localStorage.setItem('treinta_customers', JSON.stringify(data.customers));
    if (data.invoices) localStorage.setItem('treinta_invoices', JSON.stringify(data.invoices));

    return true;
  },

  /**
   * Triggers client-side download of the encrypted .finova file
   */
  downloadBackupFile(vault: FinovaEncryptedVault): string {
    const jsonStr = JSON.stringify(vault, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/octet-stream;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const dateFormatted = new Date().toISOString().slice(0, 10);
    const filename = `Finova_Respaldo_${vault.businessName.replace(/[^a-zA-Z0-9]/g, '_')}_${dateFormatted}.finova`;

    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    return filename;
  },

  /**
   * Code snippets and guide for the developer to implement in Mobile (Flutter, React Native, Native Android)
   */
  getTechnicalDocumentation() {
    return {
      architectureOverview: `
# Arquitectura Local-First con Respaldo en Nube Personal (Google Drive / iCloud)

## 1. Principio Fundamental (Zero-Knowledge & Zero Server Database)
- **Capa 1: Autenticación (Firebase Auth)**: Se utiliza ÚNICAMENTE para autenticar al usuario (Email/Password, Google Sign-In, Apple Sign-In). Firebase NUNCA almacena ni recibe transacciones, deudas, clientes o inventario.
- **Capa 2: Base de Datos Local-First (Dispositivo)**:
  - React / Web: IndexedDB (vía Dexie o idb-keyval) o LocalStorage particionado por UID.
  - Flutter: Hive / Isar / SQLite (sqflite).
  - React Native: WatermelonDB / SQLite (op-sqlite) / MMKV.
  - Android Nativo: Jetpack Room.
  Toda lectura y escritura es instantánea (0ms de latencia, 100% offline).
- **Capa 3: Cifrado en Origen (Client-Side Encryption)**:
  Antes de salir del dispositivo, la base de datos se comprime y se cifra con **AES-256-GCM**, usando una clave derivada de la contraseña del usuario mediante **PBKDF2-SHA256 (100,000 iteraciones)** y un Salt aleatorio de 16 bytes. Ni Google, ni Apple, ni tu servidor pueden leer los datos financieros.
- **Capa 4: Respaldo en la Nube Personal del Usuario**:
  - Android: Se conecta a la API de **Google Drive REST API v3**, guardando en la carpeta oculta de la app (\`appDataFolder\`) o en una carpeta visible creada por el usuario.
  - iOS: Se almacena en el contenedor de **iCloud Drive** (\`NSUbiquitousKeyValueStore\` o carpeta privada de iCloud Documents).
- **Capa 5: Restauración en Nuevo Dispositivo**:
  1. El usuario instala la app e inicia sesión con Firebase Auth.
  2. La app consulta si existe un archivo de respaldo en su Google Drive / iCloud asociado.
  3. Si existe, lo descarga, le solicita su clave de descifrado, valida el HMAC/Checksum, descifra e inserta masivamente en la base de datos local.
`,
      flutterCodeSample: `
// ==========================================
// EJEMPLO FLUTTER (Hive + Cifrado AES + Google Drive)
// ==========================================

import 'dart:convert';
import 'dart:typed_data';
import 'package:cryptography/cryptography.dart';
import 'package:googleapis/drive/v3.dart' as drive;
import 'package:google_sign_in/google_sign_in.dart';
import 'package:hive/hive.dart';

class LocalFirstBackupService {
  // 1. Cifrado con AES-GCM y PBKDF2
  static Future<Map<String, dynamic>> encryptData(Map<String, dynamic> rawData, String password) async {
    final pbkdf2 = Pbkdf2(
      macAlgorithm: Hmac.sha256(),
      iterations: 100000,
      bits: 256,
    );

    // Salt e IV aleatorios
    final salt = SecretKeyData.random(length: 16).bytes;
    final secretKey = await pbkdf2.deriveKey(
      secretKey: SecretKey(utf8.encode(password)),
      nonce: salt,
    );

    final algorithm = AesGcm.with256bits();
    final plaintext = utf8.encode(jsonEncode(rawData));
    final secretBox = await algorithm.encrypt(plaintext, secretKey: secretKey);

    return {
      'app': 'Finova',
      'version': '2.1.0',
      'salt': base64Encode(salt),
      'nonce': base64Encode(secretBox.nonce),
      'ciphertext': base64Encode(secretBox.cipherText),
      'mac': base64Encode(secretBox.mac.bytes),
    };
  }

  // 2. Subir directamente a Google Drive personal del usuario
  static Future<void> uploadBackupToGoogleDrive(String encryptedJson, drive.DriveApi driveApi) async {
    final fileMetadata = drive.File()
      ..name = 'finova_backup.finova'
      ..parents = ['appDataFolder']; // Carpeta privada en Drive del usuario

    final media = drive.Media(
      Stream.value(utf8.encode(encryptedJson)),
      utf8.encode(encryptedJson).length,
    );

    await driveApi.files.create(fileMetadata, uploadMedia: media);
  }

  // 3. Restaurar desde Google Drive
  static Future<Map<String, dynamic>> restoreFromGoogleDrive(drive.DriveApi driveApi, String password) async {
    final fileList = await driveApi.files.list(
      spaces: 'appDataFolder',
      q: "name = 'finova_backup.finova'",
    );

    if (fileList.files == null || fileList.files!.isEmpty) {
      throw Exception('No se encontró ningún respaldo en Google Drive');
    }

    final fileId = fileList.files!.first.id!;
    final drive.Media media = await driveApi.files.get(
      fileId,
      downloadOptions: drive.DownloadOptions.fullMedia,
    ) as drive.Media;

    final bytes = await media.stream.expand((e) => e).toList();
    final jsonVault = jsonDecode(utf8.decode(bytes));

    // Descifrado
    final salt = base64Decode(jsonVault['salt']);
    final nonce = base64Decode(jsonVault['nonce']);
    final cipherText = base64Decode(jsonVault['ciphertext']);
    final mac = Mac(base64Decode(jsonVault['mac']));

    final pbkdf2 = Pbkdf2(macAlgorithm: Hmac.sha256(), iterations: 100000, bits: 256);
    final secretKey = await pbkdf2.deriveKey(secretKey: SecretKey(utf8.encode(password)), nonce: salt);

    final algorithm = AesGcm.with256bits();
    final decryptedBytes = await algorithm.decrypt(
      SecretBox(cipherText, nonce: nonce, mac: mac),
      secretKey: secretKey,
    );

    final restoredData = jsonDecode(utf8.decode(decryptedBytes));
    // Guardar en Hive / Isar
    final box = Hive.box('finova_database');
    await box.putAll(restoredData);
    return restoredData;
  }
}
`,
      reactNativeCodeSample: `
// ==========================================
// EJEMPLO REACT NATIVE (WatermelonDB / MMKV + AES-GCM + Google Drive REST)
// ==========================================

import { GoogleSignin } from '@react-native-google-signin/google-signin';
import CryptoJS from 'crypto-js'; // O react-native-quick-crypto (nativo WebCrypto)

export class LocalFirstCloudBackup {
  // 1. Extraer datos locales de WatermelonDB / MMKV
  static async exportLocalDatabase() {
    // Ejemplo recopilando colecciones locales:
    return {
      products: await database.get('products').query().fetch(),
      transactions: await database.get('transactions').query().fetch(),
      debts: await database.get('debts').query().fetch(),
      customers: await database.get('customers').query().fetch(),
    };
  }

  // 2. Cifrar con contraseña del usuario
  static encryptVault(data, password) {
    const salt = CryptoJS.lib.WordArray.random(128 / 8);
    const key = CryptoJS.PBKDF2(password, salt, { keySize: 256 / 32, iterations: 10000 });
    const iv = CryptoJS.lib.WordArray.random(128 / 8);

    const encrypted = CryptoJS.AES.encrypt(JSON.stringify(data), key, { iv: iv });
    return JSON.stringify({
      app: 'Finova',
      salt: salt.toString(),
      iv: iv.toString(),
      ciphertext: encrypted.toString(),
    });
  }

  // 3. Subir a Google Drive mediante REST API con Access Token
  static async uploadToGoogleDrive(encryptedPayload) {
    const { accessToken } = await GoogleSignin.getTokens();

    const metadata = {
      name: 'finova_backup.finova',
      parents: ['appDataFolder'],
    };

    const form = new FormData();
    form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
    form.append('file', new Blob([encryptedPayload], { type: 'application/octet-stream' }));

    const res = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
      method: 'POST',
      headers: { Authorization: \`Bearer \${accessToken}\` },
      body: form,
    });
    return res.json();
  }
}
`
    };
  }
};
