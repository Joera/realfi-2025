interface DeviceCredential {
  credentialId: string
  publicKey: ArrayBuffer
  deviceNullifier: string
}



class WebAuthnDeviceAuth {
  private readonly rpId: string
  private readonly rpName: string
  private readonly isDevelopment = window.location.hostname === 'localhost'

  constructor() {
    this.rpId = window.location.hostname
    this.rpName = "s3ntiment"
  }

  /**
   * Check if WebAuthn is supported
   */
  isSupported(): boolean {
    return !!(window.PublicKeyCredential && navigator.credentials && navigator.credentials.create)
  }

  /**
   * Get available authenticator info for better UX messaging
   */
  async getAuthenticatorInfo(): Promise<{
    platform: boolean,
    crossPlatform: boolean,
    userVerifying: boolean
  }> {
    if (!this.isSupported()) {
      return { platform: false, crossPlatform: false, userVerifying: false }
    }

    try {
      const [platform, crossPlatform, userVerifying] = await Promise.all([
        PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable(),
        PublicKeyCredential.isConditionalMediationAvailable?.() || Promise.resolve(false),
        PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable()
      ])

      return { platform, crossPlatform, userVerifying }
    } catch {
      return { platform: false, crossPlatform: false, userVerifying: false }
    }
  }

  /**
   * Create device credential (first time setup)
   */
  async createDeviceCredential(): Promise<DeviceCredential> {
    if (!this.isSupported()) {
      throw new Error("WebAuthn not supported on this device")
    }

    try {
      const challenge = crypto.getRandomValues(new Uint8Array(32))
      const userId = crypto.getRandomValues(new Uint8Array(32))

      const credential = await navigator.credentials.create({
        publicKey: {
          challenge,
          rp: {
            name: this.rpName,
            id: this.rpId
          },
          user: {
            id: userId,
            name: "s3ntiment acccount",
            displayName: "S3ntiment Account"
          },
          pubKeyCredParams: [
            { alg: -7, type: "public-key" },  // ES256
            { alg: -257, type: "public-key" } // RS256 fallback
          ],
          authenticatorSelection: {
            authenticatorAttachment: "platform", // Prefer built-in authenticators
            userVerification: "required",        // Force biometric/PIN
            residentKey: "required"             // Discoverable credential
          },
          timeout: 60000,
          attestation: "none" // Don't need attestation for our use case
        }
      }) as PublicKeyCredential

      if (!credential) {
        throw new Error("Failed to create WebAuthn credential")
      }

      const response: any = credential.response as AuthenticatorAttestationResponse
      const credentialId = this.arrayBufferToHex(credential.rawId)
      const deviceNullifier = await this.generateNullifier(credential.rawId)

      console.log("WebAuthn credential created successfully")

      return {
        credentialId,
        publicKey: response.publicKey!,
        deviceNullifier
      }

    } catch (error: any) {
      console.error("WebAuthn creation failed:", error)
      
      if (error.name === 'NotSupportedError') {
        throw new Error("Device doesn't support biometric authentication")
      } else if (error.name === 'NotAllowedError') {
        throw new Error("Authentication was cancelled or failed")
      } else if (error.name === 'SecurityError') {
        throw new Error("Security requirements not met")
      }
      
      throw new Error("Device authentication failed: " + error.message)
    }
  }

  /**
   * Authenticate with existing credential
   */
  async authenticateDevice(): Promise<DeviceCredential> {
    if (!this.isSupported()) {
      throw new Error("WebAuthn not supported on this device")
    }

    try {
      const challenge = crypto.getRandomValues(new Uint8Array(32))

      const assertion = await navigator.credentials.get({
        publicKey: {
          challenge,
          timeout: 60000,
          userVerification: "required"
        }
      }) as PublicKeyCredential

      if (!assertion) {
        throw new Error("Authentication failed or cancelled")
      }

      const credentialId = this.arrayBufferToHex(assertion.rawId)
      const deviceNullifier = await this.generateNullifier(assertion.rawId)

      console.log("WebAuthn authentication successful")

      return {
        credentialId,
        publicKey: assertion.rawId, // Use rawId as public key reference
        deviceNullifier
      }

    } catch (error: any) {
      console.error("WebAuthn authentication failed:", error)
      
      if (error.name === 'NotAllowedError') {
        throw new Error("Authentication cancelled or no credential found")
      }
      
      throw new Error("Device authentication failed: " + error.message)
    }
  }

  /**
   * Try to authenticate, create credential if none exists
   */
  async getOrCreateDeviceCredential(): Promise<DeviceCredential> {
    
     if (this.isDevelopment) {
        // Create deterministic mock credential based on browser/system
        const mockId = `dev-${navigator.userAgent.slice(0, 20)}-${Date.now()}`
        return {
            credentialId: mockId,
            publicKey: new ArrayBuffer(32),
            deviceNullifier: await this.hashString(mockId)
        }
    }
        
      // Create new credential if authentication failed
      return await this.createDeviceCredential()
    
  }

    /**
   * Hash string to create deterministic identifier
   */
  private async hashString(str: string): Promise<string> {
    try {
      const encoder = new TextEncoder()
      const data = encoder.encode(str)
      const hash = await crypto.subtle.digest('SHA-256', data)
      return this.arrayBufferToHex(hash)
    } catch {
      // Fallback for older browsers
      return this.simpleHash(str)
    }
  }


  /**
   * Generate deterministic nullifier from credential ID
   */
  private generateNullifier(credentialId: ArrayBuffer): Promise<string> {
    // Create a stable hash of the credential ID
    const encoder = new TextEncoder()
    const data = new Uint8Array([
      ...encoder.encode("s3ntiment-device:"),
      ...new Uint8Array(credentialId)
    ])
    
    return crypto.subtle.digest('SHA-256', data).then(hash => 
      this.arrayBufferToHex(hash)
    ).catch(() => {
      // Fallback for older browsers
      return this.simpleHash(this.arrayBufferToHex(credentialId))
    })
  }

  /**
   * Simple hash fallback for older browsers
   */
  private simpleHash(str: string): string {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(16).padStart(8, '0')
  }

  /**
   * Convert ArrayBuffer to hex string
   */
  private arrayBufferToHex(buffer: ArrayBuffer): string {
    return Array.from(new Uint8Array(buffer))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('')
  }

  /**
   * Get user-friendly status message
   */
  async getStatusMessage(): Promise<string> {
    if (!this.isSupported()) {
      return "Device authentication not supported"
    }

    const info = await this.getAuthenticatorInfo()
    
    if (info.platform) {
      return "Ready for fingerprint/face authentication"
    } else if (info.crossPlatform) {
      return "Ready for security key authentication"
    } else {
      return "Authentication available"
    }
  }
}

/**
 * UI helper function for device authentication
 */
async function promptDeviceAuthentication(): Promise<DeviceCredential> {
  const auth = new WebAuthnDeviceAuth()
  
  if (!auth.isSupported()) {
    throw new Error("This device doesn't support secure authentication. Please use a device with fingerprint, face recognition, or PIN.")
  }

  // Show user-friendly status
  const status = await auth.getStatusMessage()
  console.log("Authentication status:", status)

  // // Show loading/instruction UI
  // const instruction = document.createElement('div')
  // instruction.innerHTML = `
  //   <div id="auth-modal" style="
  //     position: fixed; top: 0; left: 0; width: 100%; height: 100%;
  //     background: rgba(0,0,0,0.7); display: flex; align-items: center; justify-content: center;
  //     font-family: system-ui; z-index: 1000;
  //   ">
  //     <div style="
  //       background: white; padding: 30px; border-radius: 10px; text-align: center;
  //       max-width: 400px; margin: 20px;
  //     ">
  //       <h3>We want to use a passkey to generate a blockchain account</h3>
  //       <p>${status}</p>
  //       <p>Please authenticate with your fingerprint, face, or device PIN</p>
  //       <div id="auth-spinner" style="margin: 20px 0;">⏳ Waiting for authentication...</div>
  //       <button id="cancel-auth" style="margin-top: 20px;">Cancel</button>
  //     </div>
  //   </div>
  // `
  
  // document.body.appendChild(instruction)

  try {
    // Set up cancel button
    // const cancelBtn = document.getElementById('cancel-auth')
    // let cancelled = false
    // cancelBtn?.addEventListener('click', () => {
    //   cancelled = true
    //   document.body.removeChild(instruction)
    // })

    // Attempt authentication
    const credential = await auth.getOrCreateDeviceCredential()
    
    // if (cancelled) {
    //   throw new Error("Authentication cancelled")
    // }

    // // Remove UI on success
    // document.body.removeChild(instruction)
    
    return credential

  } catch (error) {
    // Remove UI on error
    // if (document.body.contains(instruction)) {
    //   document.body.removeChild(instruction)
    // }
    throw error
  }
}

export { WebAuthnDeviceAuth, promptDeviceAuthentication, DeviceCredential }