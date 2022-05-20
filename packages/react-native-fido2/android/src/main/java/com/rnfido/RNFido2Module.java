package com.rnfido;

import android.app.Activity;
import android.app.PendingIntent;
import android.content.Intent;
import android.content.IntentSender;
import android.util.Log;

import com.facebook.react.bridge.ActivityEventListener;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.BaseActivityEventListener;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.WritableMap;
import com.google.android.gms.fido.Fido;
import com.google.android.gms.fido.fido2.Fido2ApiClient;
import com.google.android.gms.fido.fido2.api.common.AuthenticationExtensionsClientOutputs;
import com.google.android.gms.fido.fido2.api.common.AuthenticatorAssertionResponse;
import com.google.android.gms.fido.fido2.api.common.AuthenticatorAttestationResponse;
import com.google.android.gms.fido.fido2.api.common.AuthenticatorErrorResponse;
import com.google.android.gms.fido.fido2.api.common.PublicKeyCredential;
import com.google.android.gms.fido.fido2.api.common.PublicKeyCredentialCreationOptions;
import com.google.android.gms.fido.fido2.api.common.PublicKeyCredentialRequestOptions;
import com.google.android.gms.tasks.OnFailureListener;
import com.google.android.gms.tasks.OnSuccessListener;
import com.google.android.gms.tasks.Task;
import com.rnfido.converters.PublicKeyCredentialCreationOptionsConverter;
import com.rnfido.converters.PublicKeyCredentialRequestConverter;

import javax.annotation.Nonnull;

public class RNFido2Module extends ReactContextBaseJavaModule {

  private static final int REQUEST_CODE_REGISTER = 110;
  private static final int REQUEST_CODE_SIGN = 111;
  private static final String E_SIGN_CANCELLED = "E_SIGN_CANCELLED";
  private static final String E_REGISTER_CANCELLED = "E_REGISTER_CANCELLED";
  private static final String E_AUTHENTICATOR_ERROR = "E_AUTHENTICATOR_ERROR";
  private static final String TAG = "RNFido2";
  private final ReactApplicationContext reactContext;
  private Promise mSignPromise;
  private Promise mRegisterPromise;

  private final ActivityEventListener mActivityEventListener = new BaseActivityEventListener() {
    @Override
    public void onActivityResult(Activity activity, int requestCode, int resultCode, Intent intent) {
      super.onActivityResult(activity, requestCode, resultCode, intent);

      if (requestCode == REQUEST_CODE_SIGN) {
        if (mSignPromise != null) {
          if (resultCode == Activity.RESULT_CANCELED) {
            mSignPromise.reject(E_SIGN_CANCELLED, "Sign was cancelled");
          } else if (resultCode == Activity.RESULT_OK) {
            if (intent.hasExtra(Fido.FIDO2_KEY_ERROR_EXTRA)) {
              AuthenticatorErrorResponse authenticatorErrorResponse =
                AuthenticatorErrorResponse.deserializeFromBytes(
                  intent.getByteArrayExtra(Fido.FIDO2_KEY_ERROR_EXTRA));
              Log.e(TAG, "FIDO2_KEY_ERROR_EXTRA Security Key: " + authenticatorErrorResponse.getErrorMessage());
              mSignPromise.reject(E_AUTHENTICATOR_ERROR, authenticatorErrorResponse.getErrorMessage());
            } else if (intent.hasExtra(Fido.FIDO2_KEY_CREDENTIAL_EXTRA)) {
              Log.i(TAG, "Received response from Security Key");
              PublicKeyCredential publicKeyCredential =
                PublicKeyCredential.deserializeFromBytes(
                  intent.getByteArrayExtra(Fido.FIDO2_KEY_CREDENTIAL_EXTRA));
              AuthenticatorAssertionResponse signedData =
                (AuthenticatorAssertionResponse) publicKeyCredential.getResponse();
              AuthenticationExtensionsClientOutputs extensionOutputs = publicKeyCredential.getClientExtensionResults();
              byte[] extensionOutputsBytes = null;
              WritableMap response = Arguments.createMap();
              byte[] userHandle = signedData.getUserHandle();
              if (extensionOutputs != null) {
                extensionOutputsBytes = extensionOutputs.serializeToBytes();
                if (extensionOutputsBytes != null) {
                  response.putString("extensions", Util.base64Encode(extensionOutputsBytes));
                }
              }
              response.putString("clientDataJSON", Util.base64Encode(signedData.getClientDataJSON()));
              response.putString("authenticatorData", Util.base64Encode(signedData.getAuthenticatorData()));
              response.putString("id", publicKeyCredential.getId());
              response.putString("rawId", Util.base64Encode(publicKeyCredential.getRawId()));
              response.putString("signature", Util.base64Encode(signedData.getSignature()));
              if (userHandle != null) {
                response.putString("userHandle", Util.base64Encode(userHandle));
              }
              mSignPromise.resolve(response);
            }
          }
        }
        mSignPromise = null;
      }

      if (requestCode == REQUEST_CODE_REGISTER) {
        Log.i(TAG, "Received pending response from Fido2 Activity");
        if (mRegisterPromise != null) {
          Log.i(TAG, "Received confirmed response from Fido2 Activity");
          if (resultCode == Activity.RESULT_CANCELED) {
            mRegisterPromise.reject(E_REGISTER_CANCELLED, "Register was cancelled");
          } else if (resultCode == Activity.RESULT_OK) {
            if (intent.hasExtra(Fido.FIDO2_KEY_ERROR_EXTRA)) {
              AuthenticatorErrorResponse authenticatorErrorResponse =
                AuthenticatorErrorResponse.deserializeFromBytes(
                  intent.getByteArrayExtra(Fido.FIDO2_KEY_ERROR_EXTRA));
              Log.e(TAG, "FIDO2_KEY_ERROR_EXTRA Security Key: " + authenticatorErrorResponse.getErrorMessage());
              mRegisterPromise.reject(E_AUTHENTICATOR_ERROR, authenticatorErrorResponse.getErrorMessage());
              return;
            }

            if (intent.hasExtra(Fido.FIDO2_KEY_CREDENTIAL_EXTRA)) {
              Log.e(TAG, "Received response from Security Key: " + Util.base64Encode(intent.getByteArrayExtra(Fido.FIDO2_KEY_CREDENTIAL_EXTRA)));
              PublicKeyCredential publicKeyCredential =
                PublicKeyCredential.deserializeFromBytes(
                  intent.getByteArrayExtra(Fido.FIDO2_KEY_CREDENTIAL_EXTRA));
              AuthenticatorAttestationResponse signedData =
                (AuthenticatorAttestationResponse) publicKeyCredential.getResponse();
              WritableMap response = Arguments.createMap();
              response.putString("clientDataJSON", Util.base64Encode(signedData.getClientDataJSON()));
              response.putString("attestationObject", Util.base64Encode(signedData.getAttestationObject()));
              response.putString("id", publicKeyCredential.getId());
              response.putString("rawId", Util.base64Encode(publicKeyCredential.getRawId()));
              mRegisterPromise.resolve(response);
              return;
            }
          }
        } else {
          Log.i(TAG, "Register promise is null");
        }
        mRegisterPromise = null;
      }
    }
  };

  public RNFido2Module(ReactApplicationContext reactContext) {
    super(reactContext);
    this.reactContext = reactContext;

    reactContext.addActivityEventListener(mActivityEventListener);
  }

  @Override
  @Nonnull
  public String getName() {
    return "RNFido2";
  }

  @ReactMethod
  public void registration(ReadableMap publicKeyCredentialCreationOptions, Promise promise) {
    mRegisterPromise = promise;

    PublicKeyCredentialCreationOptions options = PublicKeyCredentialCreationOptionsConverter.fromReadableMap(publicKeyCredentialCreationOptions);

    Fido2ApiClient fido2ApiClient = Fido.getFido2ApiClient(this.reactContext);
    final Task<PendingIntent> fido2PendingIntentTask = fido2ApiClient.getRegisterPendingIntent(options);
    final Activity activity = this.reactContext.getCurrentActivity();
    fido2PendingIntentTask.addOnSuccessListener(
      new OnSuccessListener<PendingIntent>() {
        @Override
        public void onSuccess(PendingIntent fido2PendingIntent) {
          if (fido2PendingIntent != null) {
            // Start a FIDO2 sign request.
            try {
              activity.startIntentSenderForResult(
                fido2PendingIntent.getIntentSender(),
                REQUEST_CODE_REGISTER,
                null,
                0,
                0,
                0
              );
            } catch (IntentSender.SendIntentException e) {
              Log.e(TAG, "SendIntentException: " + e);
              e.printStackTrace();
            }
          }
        }
      }
    );

    fido2PendingIntentTask.addOnFailureListener(
      new OnFailureListener() {
        @Override
        public void onFailure(Exception e) {
          // Fail
          mRegisterPromise.reject("unknown", e.getLocalizedMessage());
          mRegisterPromise = null;
        }
      }
    );
  }

  @ReactMethod
  public void sign(ReadableMap publicKeyCredentialRequestOptions, Promise promise) {
    mSignPromise = promise;

    PublicKeyCredentialRequestOptions options = PublicKeyCredentialRequestConverter.fromReadableMap(publicKeyCredentialRequestOptions);

    Fido2ApiClient fido2ApiClient = Fido.getFido2ApiClient(this.reactContext);
    final Task<PendingIntent> fido2PendingIntentTask = fido2ApiClient.getSignPendingIntent(options);
    final Activity activity = this.reactContext.getCurrentActivity();
    fido2PendingIntentTask.addOnSuccessListener(
      new OnSuccessListener<PendingIntent>() {
        @Override
        public void onSuccess(PendingIntent fido2PendingIntent) {
          if (fido2PendingIntent != null) {
            // Start a FIDO2 sign request.
            try {
              activity.startIntentSenderForResult(fido2PendingIntent.getIntentSender(),
                REQUEST_CODE_SIGN,
                null, // fillInIntent,
                0, // flagsMask,
                0, // flagsValue,
                0 //extraFlags
              );
            } catch (IntentSender.SendIntentException e) {
              e.printStackTrace();
            }
          }
        }
      }
    );

    fido2PendingIntentTask.addOnFailureListener(
      new OnFailureListener() {
        @Override
        public void onFailure(Exception e) {
          // Fail
          mSignPromise.reject("unknown", e.getMessage());
        }
      }
    );
  }
}
