class ApplicationController < ActionController::Base
  protect_from_forgery

  USERS = { "gogo" => "321liftOff" }

	before_filter :authenticate

	def authenticate
	  authenticate_or_request_with_http_digest("Webtrends Streams viz for Gogo") do |name|
	    USERS[name]
	  end
	end
end
