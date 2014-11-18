var debug = false;

/**
* global var section
*/
var menuLabel = "Lbc Alertes";
var menuMailSetupLabel = "Setup email";
var menuSearchSetupLabel = "Setup recherche";
var menuSearchLabel = "Lancer manuellement";
var menuLog = "Activer/Désactiver les logs";
var menuArchiveLog = "Archiver les logs";
var email2 = "anne.pierron@gmail.com";
//var list_url;

function lbc(sendMail){
  if(sendMail != false){
    sendMail = true;
  }
  var to = ScriptProperties.getProperty('email').split(';');
  
  // debugging email list :
  //for(var a in to) {
  //  Browser.msgBox(to[a]);
  //}
  
  var urls = [];
  if(to == "" || to == null ){
    Browser.msgBox("L'email du destinataire n'est pas définit. Allez dans le menu \"" + menuLabel + "\" puis \"" + menuMailSetupLabel + "\".");
  } else {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName("Données");
    var slog = ss.getSheetByName("Log");
    var i = 0; var nbSearchWithRes = 0; var nbResTot = 0;
    var body = ""; var corps = ""; var bodyHTML = ""; var corpsHTML = ""; var menu = ""; var searchURL = ""; var searchName = "";
    var stop = false;
    while((searchURL = sheet.getRange(2+i,2).getValue()) != ""){
      searchName = sheet.getRange(2+i,1).getValue();
      Logger.log("Recherche pour " + searchName);
      var nbRes = 0;
      body = "";
      bodyHTML = "";
      stop = false;
      var rep = UrlFetchApp.fetch(searchURL).getContentText("iso-8859-15");
      if(rep.indexOf("Aucune annonce") < 0){
        //LBC à des résultats
        var data = splitResult_(rep);
        data = data.substring(data.indexOf("<a"));
        var firsta = extractA_(data);
        if(sendMail == null || sendMail == true) {
          var holda = sheet.getRange(2+i,3).getValue();
          if(extractId_(firsta) != holda) {// && holda != ""){
            while(data.indexOf("<a") > 0 || stop == false){
              var a = extractA_(data);
              if(extractId_(a) != holda){
                //l'url de l'annonce :
                var title = extractTitle_(data);
                var place = extractPlace_(data);
                var price = extractPrice_(data);
                var vendpro = extractPro_(data);
                var date = extractDate_(data);
                var image = extractImage_(data);
                urls.push(encodeURIComponent(a));
                body = body + "<li><a href=\"" + a + "\">" + title + "</a> (" + price + " euros - " + place + ")</li>";
                bodyHTML = bodyHTML + "<li style=\"list-style:none;margin-bottom:20px; clear:both;background:#EAEBF0;border-top:1px solid #ccc;\"><div style=\"float:left;width:90px;padding: 20px 20px 0 0;text-align: right;\">"+ date +"<div style=\"float:left;width:200px;padding:20px 0;\"><a href=\"" + a + "\">"+ image +"</a> </div><div style=\"float:left;width:420px;padding:20px 0;\"><a href=\"" + a + "\" style=\"font-size: 14px;font-weight:bold;color:#369;text-decoration:none;\">" + title + vendpro +"</a> <div>" + place + "</div> <div style=\"line-height:32px;font-size:14px;font-weight:bold;\">" + price + "</div></div></li>";
                if(data.indexOf("<a",10) > 0){
                  var data = data.substring(data.indexOf("<a",10));
                }else{
                  stop = true;
                }
                nbRes++;
              }else{
                stop = true;
              }
            }
            nbSearchWithRes++;
            corps = corps + "<p>Votre recherche : <a name=\""+ searchName + "\" href=\""+ searchURL + "\"> "+ searchName +" (" + nbRes + ")</a></p><ul>" + body + "</ul>";
            corpsHTML = corpsHTML + "<p style=\"display:block;clear:both;padding-top:20px;font-size:14px;\">Votre recherche : <a name=\""+ searchName + "\" href=\""+ searchURL + "\"> "+ searchName +" (" + nbRes + ")</a></p><ul>" + bodyHTML + "</ul>";
            menu += "<li><a href=\"#"+ searchName + "\">"+ searchName +" (" + nbRes + ")</a></li>"
            if(ScriptProperties.getProperty('log') == "true" || ScriptProperties.getProperty('log') == null || ScriptProperties.getProperty('log') == ""){
              slog.insertRowBefore(2);
              slog.getRange("A2").setValue(searchName);
              slog.getRange("B2").setValue(nbRes);
              slog.getRange("C2").setValue(new Date);
            }
            //sheet.getRange(2+i,3).setValue(extractId_(firsta));
          }
        }
        sheet.getRange(2+i,3).setValue(extractId_(firsta));
        nbResTot += nbRes;
      } else {
        //pas de résultat
        sheet.getRange(2+i,3).setValue(123);
      }
      i++;
    }
    
    if(nbSearchWithRes > 1) {
      //plusieurs recherche, on créé un menu
      menu = "<p style=\"display:block;clear:both;padding-top:20px;font-size:14px;\">Accès rapide :</p><ul>" + menu + "</ul>";
      //corps = menu + corps;
      corpsHTML = menu + corpsHTML;
      debug_(menu);
    }
    
    debug_("Nb de res tot:" + nbResTot);
    //on envoie le mail?
    if(corps != ""){
      var title = "LBC-alert : " + nbResTot + " nouveau" + (nbResTot>1?"x":"") + " résultat" + (nbResTot>1?"s":"");
      debug_("titre msg : " + title);
      corps = "Si cet email ne s’affiche pas correctement, veuillez sélectionner\nl’affichage HTML dans les paramètres de votre logiciel de messagerie.";
      debug_("corps msg : " + corps);
      corpsHTML = "<body>" + corpsHTML + "</body>";
      debug_("corpsHTML msg : " + corpsHTML);
      
      for(var i in to) {        
        MailApp.sendEmail(to[i],title,corps,{ htmlBody: corpsHTML });
        //Browser.msgBox("mailing to : " + to[i]);
      }
//      Browser.msgBox("tel maison");
      call_node(urls);
      //Browser.msgBox("fin tel maison");
      debug_("Nb mail journalier restant : " + MailApp.getRemainingDailyQuota());
    }
  }
}

//telephone maison et phantomjs
function call_node(urls){
  var home = test_home_ip();
  var home_pub_ip = ScriptProperties.getProperty('home_pub_ip');
  if ( home ) {
    for( var i in urls){
       var response = UrlFetchApp.fetch("http://"+home_pub_ip+":8080/screen_shoot/url=" + urls[i]);
        //Browser.msgBox("http://85.169.66.207:8080/screen_shoot/url="+encodeURIComponent(urls[i]));
    }
  }
  else {
      //Browser.msgBox("no server : " + urls.length); //731988774
      var sss = SpreadsheetApp.getActiveSpreadsheet();
      var sheet_catchup = sss.getSheetByName("catchup");
      //Browser.msgBox(urls[0]);
      for( var i in urls){
        //Browser.msgBox("iter : " + i);
        sheet_catchup.insertRowBefore(2);
        sheet_catchup.getRange("A2").setValue(urls[i]);
        //Browser.msgBox(urls[i]);
      }
      //Browser.msgBox("no server fin");
  }
}

function setup(){
  lbc(false);
}

function setupMail(){
  if(ScriptProperties.getProperty('email') == "" || ScriptProperties.getProperty('email') == null ){
    var quest = Browser.inputBox("Entrez votre email, le programme ne vérifie pas le contenu de cette boite.", Browser.Buttons.OK_CANCEL);
    if(quest == "cancel"){
      Browser.msgBox("Ajout email annulé.");
      return false;
    }else{
      ScriptProperties.setProperty('email', quest);
      Browser.msgBox("Email " + ScriptProperties.getProperty('email') + " ajouté");
    }
  }else{
    var quest = Browser.inputBox("Entrez un email pour modifier l'email : " + ScriptProperties.getProperty('email') , Browser.Buttons.OK_CANCEL);
    if(quest == "cancel"){
      Browser.msgBox("Modification email annulé.");
      return false;
    }else{
      ScriptProperties.setProperty('email', quest);
      Browser.msgBox("Email " + ScriptProperties.getProperty('email') + " ajouté");
    }
  }
}

/**
* Extrait l'id de l'annonce LBC
*/
function extractId_(id){
  return id.substring(id.indexOf("/",25) + 1,id.indexOf(".htm"));
}

/**
* Extrait le lien de l'annonce
*/
function extractA_(data){
  return data.substring(data.indexOf("<a") + 9 , data.indexOf(".htm", data.indexOf("<a") + 9) + 4);
}

/**
* Extrait le titre de l'annonce
*/
function extractTitle_(data){
  return data.substring(data.indexOf("title=") + 7 , data.indexOf("\"", data.indexOf("title=") + 7) );
}

/**
* Extrait vendeur pro
*/
function extractPro_(data){
   var pro = data.substring(data.indexOf("category") + 9 , data.indexOf("</div>", data.indexOf("category") + 9) );
  if(pro.indexOf("(pro)") > 0){
    return " (pro)";
  }else{
    return "";
  }
}

/**
* Extrait le lieu de l'annonce
*/
function extractPlace_(data){
return data.substring(data.indexOf("placement") + 11 , data.indexOf("</div>", data.indexOf("placement") + 11) );
}

/**
* Extrait le prix de l'annonce
*/
function extractPrice_(data){
// test à optimiser car c'est hyper bourrin [mlb]
data = data.substring(0,data.indexOf("clear",10)); //racourcissement de la longueur de data pour ne pas aller chercher le prix du proudit suivant
var isPrice = String(data.substring(data.indexOf("price"), data.indexOf("price")+250)).match(/price/gi);
if (isPrice) {
var price = data.substring(data.indexOf("price") + 7 , data.indexOf("</div>", data.indexOf("price") + 7) );
} else {
var price = "";
}
return price;
}

/**
* Extrait tla date de l'annonce
*/
function extractDate_(data){
return data.substring(data.indexOf("date") + 6 , data.indexOf("class=\"image\"", data.indexOf("date") + 6) - 5);
}

/**
* Extrait l'image de l'annonce
*/
function extractImage_(data){
// test à optimiser car c'est hyper bourrin [mlb]
var isImage = String(data.substring(data.indexOf("image"), data.indexOf("image")+250)).match(/img/gi);
if (isImage) {
var image = data.substring(data.indexOf("class=\"image-and-nb\">") + 21, data.indexOf("class=\"nb\"", data.indexOf("class=\"image-and-nb\">") + 21) - 12);
} else {
var image = "";
}
return image;
}

/**
* Extrait la liste des annonces
*/
function splitResult_(text){
var debut = text.indexOf("<div class=\"list-lbc\">");
var fin = text.indexOf("<div class=\"list-gallery\">");
return text.substring(debut + "<div class=\"list-lbc\">".length,fin);
}

//Activer/Désactiver les logs
function dolog(){
  if(ScriptProperties.getProperty('log') == "true"){
    ScriptProperties.setProperty('log', false);
    Browser.msgBox("Les logs ont été désactivées.");
  }else if(ScriptProperties.getProperty('log') == "false"){
    ScriptProperties.setProperty('log', true);
    Browser.msgBox("Les logs ont été activées.");
  }else{
    ScriptProperties.setProperty('log', false);
    Browser.msgBox("Les logs ont été désactivées.");
  }
}

//Archiver les logs
function archivelog(){
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var slog = ss.getSheetByName("Log");
  var today  = new Date();
  var newname = "LogArchive " + today.getFullYear()+(today.getMonth()+1)+today.getDate();
  slog.setName(newname);
  var newsheet = ss.insertSheet("Log",1);
  newsheet.getRange("A1").setValue("Recherche");
  newsheet.getRange("B1").setValue("Nb Résultats");
  newsheet.getRange("C1").setValue("Date");
  newsheet.getRange(1,1,2,3).setBorder(true,true,true,true,true,true);
}


function onOpen() {
var sheet = SpreadsheetApp.getActiveSpreadsheet();
var entries = [{
name : menuMailSetupLabel,
functionName : "setupMail"
},{
name : menuSearchSetupLabel,
functionName : "setup"
},
  null
,{
name : menuSearchLabel,
functionName : "lbc"
},
null
,{
name : menuLog,
functionName : "dolog"
},{
name : menuArchiveLog,
functionName : "archivelog"
}];
sheet.addMenu(menuLabel, entries);
}

function onInstall()
{
onOpen();
}

/**
* Retourne la date
*/
function myDate_(){
var today = new Date();
debug_(today.getDate()+"/"+(today.getMonth()+1)+"/"+today.getFullYear());
return today.getDate()+"/"+(today.getMonth()+1)+"/"+today.getFullYear();
}

/**
* Retourne l'heure
*/
function myTime_(){
var temps = new Date();
var h = temps.getHours();
var m = temps.getMinutes();
if (h<"10"){h = "0" + h ;}
if (m<"10"){m = "0" + m ;}
debug_(h+":"+m);
return h+":"+m;
}

/**
* Debug
*/
function debug_(msg) {
if(debug != null && debug) {
Browser.msgBox(msg);
}
}


/**
get pub ip in gmail
**/
function get_pub_ip() {
var home_pub_ip = "127.0.0.1"
var threads = GmailApp.search('is:unread subject:"ip" from:"ludovic.sterling@gmail.com" to:"ludovic.sterling@gmail.com" after:2014/11/10 ', 0, 1);

/* just to read alls returned mails thread
for (var i in threads){  
  var messages_in_thread = threads[i].getMessages();
  for (var j in messages_in_thread){
      Browser.msgBox(messages_in_thread[j].getBody().split('<br />')[0]);      
      }
  }
 */
 
 //Browser.msgBox("nb threads : " +threads.length);
 if ( threads.length > 0) {
  for (var i in threads){  
    var messages_in_thread = threads[i].getMessages();
      ScriptProperties.setProperty('home_pub_ip', messages_in_thread[0].getBody().split('<br />')[0]);
      //Browser.msgBox(messages_in_thread[0].getDate());
   //var home_pub_ip = ScriptProperties.getProperty('home_pub_ip');
   }
  //Browser.msgBox("home ip " +home_pub_ip);
  }
  
//Browser.msgBox("prop ip " +ScriptProperties.getProperty('home_pub_ip'));
}


function test_home_ip(){
  var home_pub_ip = ScriptProperties.getProperty('home_pub_ip');
  var response = UrlFetchApp.fetch("http://"+home_pub_ip+":8080/about").getContentText("UTF-8");
  if ( response == "ok" ) {return true;}
  else { return false; }
}

function clear_home_ip_mails(){
  var today = new Date();
  var today_search = today.getFullYear()+"/"+(today.getMonth()+1)+"/"+today.getDate()

  
  var threads = GmailApp.search('is:unread subject:"ip" from:"ludovic.sterling@gmail.com" to:"ludovic.sterling@gmail.com" before:'+ today_search);
   if ( threads.length > 0) {
      var messages_todelete = [];
      for (var i in threads){
        var messages = threads[i].getMessages();
        for(var j in messages){
          messages_todelete.push(messages[j]);
        }
        GmailApp.moveMessagesToTrash(messages_todelete);
      }     
  }
  Browser.msgBox("all cleared");
}

//inutile à virer
function test_insert(){
      Browser.msgBox("no server");
      var ss = SpreadsheetApp.getActiveSpreadsheet();
      var sheet_catchup = ss.getSheetByName("catchup");
      var toto = "http://www.leboncoin.fr/ventes_immobilieres/668223025.htm";

        sheet_catchup.insertRowBefore(2);
        sheet_catchup.getRange("A2").setValue(toto);
//        Browser.msgBox(urls[i]);
      
      Browser.msgBox("no server fin");
}

function go_catchup(){
  var home = test_home_ip();

  if ( home ) {
      var ss = SpreadsheetApp.getActiveSpreadsheet();
      var sheet_catchup = ss.getSheetByName("catchup");
      var url = "";
      var i = 0;
      home_pub_ip = ScriptProperties.getProperty('home_pub_ip');
      
      while((url = sheet_catchup.getRange(2+i,1).getValue()) != ""){
        var response = UrlFetchApp.fetch("http://"+home_pub_ip+":8080/screen_shoot/url=" + url);
        if ( response == "ok" ) {
          sheet_catchup.deleteRow(2+i);
        }        
        else { 
          i++;        
        }        
      }  
  }
  else {
      Browser.msgBox("no server : " + ScriptProperties.getProperty('home_pub_ip') + " please try later");      
  }
}


