package com.rnfido.converters;

import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.bridge.ReadableMap;
import com.google.android.gms.fido.fido2.api.common.AuthenticationExtensions;
import com.google.android.gms.fido.fido2.api.common.PublicKeyCredentialDescriptor;
import com.google.android.gms.fido.fido2.api.common.PublicKeyCredentialRequestOptions;
import com.rnfido.Util;

import java.util.List;

public class PublicKeyCredentialRequestConverter {
  public static PublicKeyCredentialRequestOptions fromReadableMap(ReadableMap m) {

    PublicKeyCredentialRequestOptions.Builder builder = new PublicKeyCredentialRequestOptions.Builder();

    // challenge
    String challenge = m.getString("challenge");
    if (challenge == null) throw new IllegalArgumentException("The challenge property is missing");
    byte[] challengeBytes = Util.base64Decode(challenge);
    builder.setChallenge(challengeBytes);

    // (optional) timeout
    Double timeout = m.getDouble("timeout");
    if (!timeout.equals(Double.NaN))
      builder.setTimeoutSeconds(timeout);

    // rpId
    // should be optional by specification, but Android Fido2ApiClient requires it
    String rpId = m.getString("rpId");
    if (rpId == null) throw new IllegalArgumentException("The rpId property is missing");
    builder.setRpId(rpId);

    // (optional) allowCredentials
    ReadableArray allowCredentials = m.getArray("allowCredentials");
    if (allowCredentials != null) {
      List<PublicKeyCredentialDescriptor> allowCredentialsObjects = CommonConverters.publicKeyCredentialDescriptorFromReadableArray(allowCredentials, "allowCredentials");
      builder.setAllowList(allowCredentialsObjects);
    }

    // (optional) userVerification
    // IGNORED: Unsupported by Android Fido2ApiClient

    // (optional) extensions
    ReadableMap extensions = m.getMap("extensions");
    if (extensions != null) {
      AuthenticationExtensions authenticationExtensions = CommonConverters.authenticationExtensionsFromReadableMap(extensions);
      builder.setAuthenticationExtensions(authenticationExtensions);
    }

    return builder.build();
  }

  public static ReadableMap toReadableMap(PublicKeyCredentialRequestOptions o) {
    throw new UnsupportedOperationException();
  }
}

