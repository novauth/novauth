package com.rnfido.converters;

import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.bridge.ReadableMap;
import com.google.android.gms.fido.common.Transport;
import com.google.android.gms.fido.fido2.api.common.AuthenticationExtensions;
import com.google.android.gms.fido.fido2.api.common.FidoAppIdExtension;
import com.google.android.gms.fido.fido2.api.common.PublicKeyCredentialDescriptor;
import com.rnfido.Util;

import java.util.ArrayList;
import java.util.List;

public class CommonConverters {
  public static List<PublicKeyCredentialDescriptor> publicKeyCredentialDescriptorFromReadableArray(ReadableArray r, String fieldName) {
    List<PublicKeyCredentialDescriptor> descriptors = new ArrayList<>();
    for (int i = 0; i < r.size(); i++) {
      ReadableMap excludeCredential = r.getMap(i);
      String type = excludeCredential.getString("type");
      String id = excludeCredential.getString("id");
      if (type == null || id == null)
        throw new IllegalArgumentException("Some fields from the" + fieldName + " property are missing");
      byte[] idBytes = Util.base64Decode(id);

      ReadableArray transports = excludeCredential.getArray("transports");
      List<Transport> transportsObjects = null;
      if (transports != null) {
        transportsObjects = new ArrayList<>();
        for (int j = 0; j < transports.size(); j++) {
          try {
            transportsObjects.add(Transport.fromString(transports.getString(j)));
          } catch (Transport.UnsupportedTransportException e) {
            throw new IllegalArgumentException("Some fields from the " + fieldName + " property are invalid.");
          }
        }
      }
      descriptors.add(new PublicKeyCredentialDescriptor(type, idBytes, transportsObjects));
    }
    return descriptors;
  }

  public static AuthenticationExtensions authenticationExtensionsFromReadableMap(ReadableMap r) {

    AuthenticationExtensions.Builder extensionsBuilder = new AuthenticationExtensions.Builder();
    // (optional) appid
    String appid = r.getString("appid");
    if (appid != null)
      extensionsBuilder.setFido2Extension(new FidoAppIdExtension(appid));
    // TODO: Support for other WebAuthn extensions
    return extensionsBuilder.build();
  }
}
