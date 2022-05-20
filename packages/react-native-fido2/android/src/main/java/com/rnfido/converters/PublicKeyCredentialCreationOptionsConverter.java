package com.rnfido.converters;

import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.bridge.ReadableMap;
import com.google.android.gms.fido.fido2.api.common.Attachment;
import com.google.android.gms.fido.fido2.api.common.AttestationConveyancePreference;
import com.google.android.gms.fido.fido2.api.common.AuthenticationExtensions;
import com.google.android.gms.fido.fido2.api.common.AuthenticatorSelectionCriteria;
import com.google.android.gms.fido.fido2.api.common.PublicKeyCredentialCreationOptions;
import com.google.android.gms.fido.fido2.api.common.PublicKeyCredentialDescriptor;
import com.google.android.gms.fido.fido2.api.common.PublicKeyCredentialParameters;
import com.google.android.gms.fido.fido2.api.common.PublicKeyCredentialRpEntity;
import com.google.android.gms.fido.fido2.api.common.PublicKeyCredentialUserEntity;
import com.rnfido.Util;

import java.util.ArrayList;
import java.util.List;

public class PublicKeyCredentialCreationOptionsConverter {
  public static PublicKeyCredentialCreationOptions fromReadableMap(ReadableMap m) {

    PublicKeyCredentialCreationOptions.Builder builder = new PublicKeyCredentialCreationOptions.Builder();

    // rp
    ReadableMap rpMap = m.getMap("rp");
    if (rpMap == null) throw new IllegalArgumentException("The rp property is missing");
    String rpId = rpMap.getString("id");
    String rpName = rpMap.getString("name");
    if (rpId == null || rpName == null)
      throw new IllegalArgumentException("Some fields from the rp property are missing");
    builder.setRp(new PublicKeyCredentialRpEntity(rpId, rpName, null));

    // user
    ReadableMap userMap = m.getMap("user");
    if (userMap == null) throw new IllegalArgumentException("The user property is missing");
    String userId = userMap.getString("id");
    String userName = userMap.getString("name");
    String userDisplayName = userMap.getString("displayName");
    if (userId == null || userName == null || userDisplayName == null)
      throw new IllegalArgumentException("Some fields from the user property are missing");
    byte[] userIdBytes = Util.base64Decode(userId);
    builder.setUser(new PublicKeyCredentialUserEntity(userIdBytes, userName, "", userDisplayName));

    // challenge
    String challenge = m.getString("challenge");
    if (challenge == null) throw new IllegalArgumentException("The challenge property is missing");
    byte[] challengeBytes = Util.base64Decode(challenge);
    builder.setChallenge(challengeBytes);

    // pubKeyCredParams
    ReadableArray pubKeyCredParams = m.getArray("pubKeyCredParams");
    if (pubKeyCredParams == null)
      throw new IllegalArgumentException("The pubKeyCredParams property is missing");
    List<PublicKeyCredentialParameters> pubKeyCredParamsObjects = new ArrayList<>();
    for (int i = 0; i < pubKeyCredParams.size(); i++) {
      ReadableMap pubKeyCredParam = pubKeyCredParams.getMap(i);
      String type = pubKeyCredParam.getString("type");
      int alg = pubKeyCredParam.getInt("alg");
      if (type == null || !pubKeyCredParam.hasKey("alg"))
        throw new IllegalArgumentException("Some fields from the pubKeyCredParams property are missing");
      pubKeyCredParamsObjects.add(new PublicKeyCredentialParameters(type, alg));
    }
    builder.setParameters(pubKeyCredParamsObjects);

    // (optional) timeout
    Double timeout = m.getDouble("timeout");
    if (!timeout.equals(Double.NaN))
      builder.setTimeoutSeconds(timeout);

    // (optional) excludeCredentials
    ReadableArray excludeCredentials = m.getArray("excludeCredentials");
    if (excludeCredentials != null) {
      List<PublicKeyCredentialDescriptor> excludeCredentialsObjects = CommonConverters.publicKeyCredentialDescriptorFromReadableArray(excludeCredentials, "excludeCredentials");
      builder.setExcludeList(excludeCredentialsObjects);
    }

    // (optional) authenticatorSelection
    ReadableMap authenticatorSelection = m.getMap("authenticatorSelection");
    if (authenticatorSelection != null) {
      AuthenticatorSelectionCriteria.Builder authenticatorSelectionBuilder = new AuthenticatorSelectionCriteria.Builder();
      // (optional) authenticatorAttachment
      String authenticatorAttachment = authenticatorSelection.getString("authenticatorAttachment");
      if (authenticatorAttachment != null) {
        try {
          authenticatorSelectionBuilder.setAttachment(Attachment.fromString(authenticatorAttachment));
        } catch (Attachment.UnsupportedAttachmentException e) {
          throw new IllegalArgumentException("Some fields from the authenticatorSelection property are invalid.");
        }
      }

      // (optional) residentKey
      // IGNORED: Unsupported by Android Fido2ApiClient

      // (optional) requireResidentKey
      if (authenticatorSelection.hasKey("requireResidentKey")) {
        boolean requireResidentKey = authenticatorSelection.getBoolean("requireResidentKey");
        authenticatorSelectionBuilder.setRequireResidentKey(requireResidentKey);
      }

      // (optional) userVerification
      // IGNORED: Unsupported by Android Fido2ApiClient
      builder.setAuthenticatorSelection(authenticatorSelectionBuilder.build());
    }

    // (optional) attestation
    String attestation = m.getString("attestation");
    if (attestation != null) {
      try {
        builder.setAttestationConveyancePreference(AttestationConveyancePreference.fromString(attestation));
      } catch (AttestationConveyancePreference.UnsupportedAttestationConveyancePreferenceException e) {
        throw new IllegalArgumentException("The attestation property is invalid.");
      }
    }

    // (optional) extensions
    ReadableMap extensions = m.getMap("extensions");
    if (extensions != null) {
      AuthenticationExtensions authenticationExtensions = CommonConverters.authenticationExtensionsFromReadableMap(extensions);
      builder.setAuthenticationExtensions(authenticationExtensions);
    }

    // return the built options
    return builder.build();
  }

  public static ReadableMap toReadableMap(PublicKeyCredentialCreationOptions o) {
    throw new UnsupportedOperationException();
  }
}
