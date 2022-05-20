package com.rnfido;

import android.util.Base64;

public class Util {

  public static String base64Encode(byte[] b) {
    return Base64.encodeToString(b, Base64.NO_WRAP);
  }

  public static byte[] base64Decode(String s) {
    return Base64.decode(s, Base64.DEFAULT);
  }

}
