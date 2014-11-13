#!/usr/bin/env python
#import os
import urllib2
import json
import smtplib
#from smtplib import SMTP

def check_in():
#    fqn = os.uname()[1]
    ext_ip = urllib2.urlopen('http://jsonip.com/').read()
#    print ext_ip
    return ext_ip

def sendmail(ip):
	to = 'ludovic.sterling@gmail.com'
	gmail_user = 'ludovic.sterling@gmail.com'
	gmail_pwd = 'Sterling06'
	smtpserver = smtplib.SMTP("smtp.gmail.com",587)
	smtpserver.ehlo()
	smtpserver.starttls()
	smtpserver.ehlo
	smtpserver.login(gmail_user, gmail_pwd)

	header = 'To:' + to + '\n' + 'From: ' + gmail_user + '\n' + 'Subject:ip \n'
#	print header
	msg = header + '%s' % ip
#	print msg
	smtpserver.sendmail(gmail_user, to, msg)
#	print 'done!'
	smtpserver.close()

data_json = check_in()
#print data_json
data = json.loads(data_json)
#print data["ip"]
sendmail(data["ip"])

