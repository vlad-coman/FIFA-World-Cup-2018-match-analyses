    // Managing Delete Comments buttons to be an "a" tag that submits the form to DELETE route
    let deleteCommentsForms = document.getElementsByClassName("deleteCommentsForm");
    let deleteCommentsButtons = document.getElementsByClassName("deleteCommentsButton");
    deleteCommentsForms = Array.from(deleteCommentsForms);
    deleteCommentsButtons = Array.from(deleteCommentsButtons);

    if (deleteCommentsButtons.length > 0) {
        for (let i = 0; i < deleteCommentsButtons.length; i++) {
            deleteCommentsButtons[i].addEventListener("click", () => {
                deleteCommentsForms[i].submit();
            });
        }
    }
    
    // Managing Delete Replies buttons to be an "a" tag that submits the form to DELETE route
    let deleteRepliesButtons = document.getElementsByClassName("deleteRepliesButtons");
    let deleteRepliesForms = document.getElementsByClassName("deleteRepliesForms");

    if (deleteRepliesButtons.length > 0) {
        for (let i = 0; i < deleteRepliesButtons.length; i++) {
            deleteRepliesButtons[i].addEventListener("click", () => {
                deleteRepliesForms[i].submit();
            });
        }
    }

    //Managing SHOW/HIDE of the REPLY FORM when we CLICK on REPLY BUTTON   
    let replyForms = document.getElementsByClassName("repy_form");
    let replyButtons = document.getElementsByClassName("replyButton");
    replyForms = Array.from(replyForms);
    replyButtons = Array.from(replyButtons);

    for (let i = 0; i < replyButtons.length; i++) {
        replyButtons[i].addEventListener('click', () => {
            let focus = document.createAttribute("autofocus");
            replyForms[i].classList.toggle('show_hide');
            replyForms[i].setAttributeNode(focus);
        });
    }

    //Managing SHOW/HIDE ALL of the Replies for a Comment
    let showHideReplies = document.getElementsByClassName("hide_show_replies");
    showHideReplies = Array.from(showHideReplies);
    let repliesContainerForOneComment = document.getElementsByClassName("repliesContainerForOneComment");
    repliesContainerForOneComment = Array.from(repliesContainerForOneComment);

    for (let i = 0; i < showHideReplies.length; i++) {
        showHideReplies[i].addEventListener('click', () => {
            repliesContainerForOneComment[i].classList.toggle('show_hide');
            if (repliesContainerForOneComment[i].classList.contains('show_hide')) {
                showHideReplies[i].innerHTML = "Show Replies";
            } else {
                showHideReplies[i].innerHTML = "Hide Replies";
            }
        });
    }
