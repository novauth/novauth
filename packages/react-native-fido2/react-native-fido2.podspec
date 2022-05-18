require "json"

package = JSON.parse(File.read(File.join(__dir__, "package.json")))

Pod::Spec.new do |s|
  s.name         = "@novauth/react-native-fido2"
  s.version      = package["version"]
  s.summary      = package["description"]
  s.description  = <<-DESC
                  @novauth/react-native-fido2
                   DESC
  s.homepage     = "https://github.com/novauth/novauth"
  s.license      = "MIT"
  s.authors      = { "Matteo Agnoletto" => "info@epmatt.com" }
  s.platforms    = { :ios => "10.0" }
  s.source       = { :git => "https://github.com/novauth/novauth.git", :tag => "#{s.version}" }

  s.source_files = "ios/**/*.{h,m,swift}"
  s.requires_arc = true

  s.dependency "React"
  s.dependency "RNWebAuthnKit", '~> 0.9.10'
end

