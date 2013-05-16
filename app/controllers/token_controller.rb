require 'TokenRequest.rb'

class TokenController < ApplicationController
	def get
		client_id = "f9aaec0014884c73be2fe3e3d81e0ef4.app.webtrends.com"
		client_secret = "f778009036b74bd5addbf2c6b1505d78"
		tr = Webtrends::Client::Authentication::TokenRequest.new client_id, client_secret
		@token = { :token => tr.execute }
		render :json => @token
	end
end
