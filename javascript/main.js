const chat = document.getElementById('chat');
const dateElement = document.getElementById('curDate');
const searchBtn = document.getElementById('search_btn');
const searchField = document.getElementById('search_fld');
const searchElms = document.getElementById('search');
const selectChat = document.getElementById('select_chat');
const dateRegex = /([0-9]+(\.[0-9]+)+), [0-9]+:[0-9]+ - /i;
const dateRegexVar = /\[([0-9]+(\.[0-9]+)+), [0-9]{2}:[0-9]{2}:[0-9]{2}(\.[0-9]{1,3})?\] /i;
const colors = ['crimson', 'red', 'deeppink', 'orangered', 'orange', 'gold', 'magenta', 'blueviolet', 'darkstateblue', 'blue', 'dodgerblue', 'limegreen'];
var curColor = -1;
var contacts = {};
var curDate = '';
var elms = [];
var startElmIndex = 0;
var endElmIndex = 0;
var searchedMessages = [];
var curNavigateIndex = -1;

function readChat(text)
{
    elms = [];
    contacts = {};
    curDate = '';
    curColor = -1;
    var firstRegex = true;
    if(dateRegexVar.test(text.slice(0,23)))
        firstRegex = false;
    for(var i = 0; i < text.length; i++)
    {
        let day = text.slice(i,i+2);
        let month = text.slice(i+3,i+5);
        let year = text.slice(i+6,i+10);
        let date = day + '.' + month + '.' + year;
        if(date != curDate)
        {
            curDate = date;
            let dateElm = document.createElement('li');

            let dateText = document.createElement('div');
            dateText.setAttribute('class', 'date');
            dateText.textContent = date;

            dateElm.appendChild(dateText);
            dateElm.setAttribute('id', elms.length);
            
            elms.push(dateElm);
        }
        let time = text.slice(i+12,i+17);
        if(firstRegex)
            i += 20;
        else 
            i += 22;
        let sender = '';
        while(i < text.length && text[i] != ':')
        {
            sender += text[i];
            i++;
        }
        sender.trimEnd()
        i++;
        let message = "";
        if(firstRegex)
        {
            while(i < text.length && !dateRegex.test(text.slice(i,i+21)) )
            {
                message += text[i];
                i++;
            }
        }
        else 
        {
            while(i < text.length && !dateRegexVar.test(text.slice(i,i+23)) )
            {
                message += text[i];
                i++;
            }
        }
        
        let messageElm = document.createElement('li');
        messageElm.setAttribute('class', 'message');
        messageElm.setAttribute('id', elms.length);
        messageElm.setAttribute('date', date);

        let messageText = document.createElement('div');
        messageText.setAttribute('class', 'messageText');

        let senderElm = document.createElement('div');
        senderElm.setAttribute('class', 'sender');
        if( !(sender in contacts) )
        {
            curColor++;
            contacts[sender] = curColor;
        }
        senderElm.style.color = colors[contacts[sender]%12];

        let timeElm = document.createElement('div');
        timeElm.setAttribute('class', 'time');

        messageText.textContent = message;
        timeElm.textContent = time;
        senderElm.textContent = sender;

        messageElm.appendChild(senderElm);
        messageElm.appendChild(messageText);
        messageElm.appendChild(timeElm);

        elms.push(messageElm);
    }
    chatLoad(elms.length-1);
}

function chatLoad(index)
{
    chat.innerHTML = "";
    var startIndex = index-100 < 0 ? 0 : index-100;
    for(var i = startIndex; i <= index; i++)
        chat.appendChild(elms[i]);
    startElmIndex = startIndex;
    endElmIndex = parseInt(index);
    document.onscroll = checkPosition;
    window.scrollTo(0, document.body.scrollHeight);
}

function chatUpdate(bottom)
{
    if(bottom) // end of the list
    {
        var endIndex = endElmIndex+50 > elms.length-1 ? elms.length-1 : endElmIndex+50;
        var size = endIndex-endElmIndex;
        for(var i = endElmIndex+1; i <= endIndex; i++)
            chat.append(elms[i]);
        elms[endElmIndex].scrollIntoView({block:'end'});
        endElmIndex = endIndex;
        for(var i = startElmIndex; i < startElmIndex+size; i++)
            chat.removeChild(elms[i]);
        startElmIndex += size;
    }
    else // start of the list
    {
        var startIndex = startElmIndex-50 < 0 ? 0 : startElmIndex-50;
        var size = startElmIndex-startIndex;
        for(var i = startElmIndex-1; i >= startIndex; i--)
            chat.prepend(elms[i]);
        elms[startElmIndex].scrollIntoView({block:'start'});
        startElmIndex = startIndex;
        for(var i = endElmIndex-size+1; i <= endElmIndex; i++)
            chat.removeChild(elms[i]);
        endElmIndex -= size;
    }
}

function loadMessage(index)
{
    if(index >= startElmIndex && index <= endElmIndex)
        elms[index].scrollIntoView( {block:'center'} );
    else 
    {
        index = parseInt(index);
        chat.innerHTML = "";
        var startIndex = index-50 < 0 ? 0 : index-50;
        var size = index-startIndex;
        var endIndex = index+size > elms.length ? elms.length : index+size;
        for(var i = startIndex; i <= endIndex; i++)
            chat.append(elms[i]);
        startElmIndex = startIndex;
        endElmIndex = endIndex;
        elms[index].scrollIntoView( {block:'center'} );
    }
}

function checkPosition()
{
    var curDate = document.elementFromPoint(window.innerWidth/2, 0).getAttribute('date');
    if(curDate != null && dateElement.textContent != curDate)
        dateElement.textContent = curDate;
    var position = window.innerHeight + window.scrollY;
    if(position >= document.body.offsetHeight && endElmIndex < elms.length-1)
        chatUpdate(true);
    else if(position <= window.innerHeight+200 && startElmIndex > 0)
        chatUpdate(false);
    dateElement.style.opacity = 1;
    setTimeout(function() { dateElement.style.opacity = 0; }, 700);
}

function searchBtnClicked()
{
    if(searchElms.style.visibility == 'hidden')
    {
        searchElms.style.visibility = 'visible';
        searchBtn.textContent = 'Cancel';
    }
    else 
    {
        searchElms.style.visibility = 'hidden';
        searchBtn.textContent = 'Search';
        document.getElementById('up_btn').style.visibility = 'hidden';
        document.getElementById('down_btn').style.visibility = 'hidden';
        searchField.value = '';
        document.getElementById('number_messages').textContent = ''
    }
}

function search(e)
{
    if(e.keyCode == 13)
    {
        document.getElementById('up_btn').style.visibility = 'hidden';
        document.getElementById('down_btn').style.visibility = 'hidden';
        let text = searchField.value;
        if(text.length < 2)
            return;
        searchedMessages = []
        for(var i = 0; i < elms.length; i++)
        {
            let index = 0;
            if(elms[i].childNodes.length > 1)
                index = 1;
            if(elms[i].childNodes[index].textContent.includes(text))
                searchedMessages.push(elms[i]);
            else if(elms[i].childNodes[0].textContent.includes(text))
                searchedMessages.push(elms[i]);
        }
        curNavigateIndex = searchedMessages.length-1;
        document.getElementById('number_messages').textContent = (searchedMessages.length-curNavigateIndex) + " of " + searchedMessages.length + " messages";
        if(searchedMessages.length > 1)
            document.getElementById('up_btn').style.visibility = 'visible';
        loadMessage(searchedMessages[curNavigateIndex].getAttribute('id'));
    }
}
function upPressed()
{
    curNavigateIndex--;
    if(curNavigateIndex == 0)
        document.getElementById('up_btn').style.visibility = 'hidden';
    document.getElementById('down_btn').style.visibility = 'visible';
    document.getElementById('number_messages').textContent = (searchedMessages.length-curNavigateIndex) + " of " + searchedMessages.length + " messages";
    loadMessage(searchedMessages[curNavigateIndex].getAttribute('id'));
}
function downPressed()
{
    curNavigateIndex++;
    if(curNavigateIndex == searchedMessages.length-1)
        document.getElementById('down_btn').style.visibility = 'hidden';
    document.getElementById('up_btn').style.visibility = 'visible';
    document.getElementById('number_messages').textContent = (searchedMessages.length-curNavigateIndex) + " of " + searchedMessages.length + " messages";
    loadMessage(searchedMessages[curNavigateIndex].getAttribute('id'));
}

function fileSelected(event)
{
    event.preventDefault();

	// If there's no file, do nothing
	if (!file.value.length) return;

	// Create a new FileReader() object
	let reader = new FileReader();

	// Setup the callback event to run when the file is read
	reader.onload = logFile;

	// Read the file
	reader.readAsText(file.files[0]);
}

function logFile (event) {
	let text = event.target.result;
	readChat(text);
    searchBtn.style.visibility = 'visible';
}