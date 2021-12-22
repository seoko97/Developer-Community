import { makeHeader } from "../components/header.js";
import { makeFooter } from "../components/footer.js";
import { editUserInfo, getUserInfo, inSignout } from "../api/dummy/index.js";
import { makeSkillTag, selectTag, toggleTag } from "../components/tag.js";
import { removeChildsAll, isNull } from "../components/utils.js";
import { changePassword } from "../api/user/changePassword.js";

//DOM elements
const container = document.getElementsByClassName("container")[0];
const header = makeHeader();
const footer = makeFooter();
const main = document.getElementById("main");
const nameForm = document.getElementById("nicknameForm");
const tagForm = document.getElementById("tagForm");
const passwordForm = document.getElementById("passwordForm");
const title = document.getElementsByClassName("page-title")[0];

const p = `<p class="label">기술스택</p>`;
const tagBtn = document.createElement("div");
tagBtn.innerHTML = `<input type="submit" class="updateBtn" id="tagBtn" value="기술 스택 수정" />`;
const newTag = document.createElement("input");
newTag.setAttribute("class", "data");
newTag.setAttribute("id", "tagValue");
newTag.setAttribute("placeholder", "추가하고 싶은 기술스택을 입력하고 엔터를 눌러주세요");

// Header, footer append
container.insertBefore(header, main);
container.appendChild(footer);

const pathname = window.location.pathname.split("/");
const currentUserId = pathname[pathname.length - 1];

// page onload
window.onload = setUpdateData();

// display user nickname, tags
function setUpdateData() {
  getUserInfo(currentUserId)
    .then((res) => {
      if (!res.status) return alert(res.message);

      const { nickname, tags } = res.data.user;
      const name = document.getElementById("nicknameValue");
      name.value = nickname;
      title.innerText = `${nickname}님의 프로필`;
      removeChildsAll(tagForm);
      tagForm.innerHTML = p;
      for (let i = 0; i < tags.length; i++) {
        const tag = makeSkillTag(tags[i], true, true);
        tagForm.appendChild(tag);
        tag.addEventListener("click", toggleTag);
      }
      tagForm.appendChild(newTag);
      tagForm.appendChild(tagBtn);
    })
    .catch((e) => alert(e.message));
}

nameForm.addEventListener("submit", (e) => {
  e.preventDefault();
  btnSubmit("nickname");
});

tagForm.addEventListener("submit", (e) => {
  e.preventDefault();
  btnSubmit("tags");
});
passwordForm.addEventListener("submit", (e) => {
  e.preventDefault();
  confirmPassword();
});

// nickname, tags 변경 이벤트 함수
function btnSubmit(queryname) {
  if (queryname === "nickname") {
    const nickname = document.getElementById("nicknameValue").value;
    editUserInfo(currentUserId, nickname, `${queryname}`)
      .then((res) => {
        if (res.status) {
          alert(res.message);
          setUpdateData();
        }
      })
      .catch((e) => alert(e.message));
  } else {
    const tagList = selectTag();
    editUserInfo(currentUserId, tagList, "tags")
      .then((res) => {
        if (res.status) {
          alert(res.message);
          setUpdateData();
        }
      })
      .catch((e) => alert(e.message));
  }
}

// 비밀번호 확인 함수
function confirmPassword() {
  const currPw = document.getElementById("currPw").value;
  const changePw = document.getElementById("changePw").value;
  const checkPw = document.getElementById("checkPw").value;
  if (isNull([currPw, changePw, checkPw]))
    return alert("현재 비밀번호, 변경 비밀번호, 비밀번호 확인을 모두 입력해주세요!");

  if (changePw !== checkPw) return alert("변경할 비밀번호와 비밀번호 확인이 다릅니다");
  if (validationPw(checkPw)) {
    // TODO : changePassword 함수 동작 확인
    changePassword({ currentPassword: `${currPw}`, password: `${checkPw}` })
      .then((res) => {
        if (res.status) {
          alert(res.message);
        }
      })
      .catch((e) => alert(e.message));
    inSignout()
      .then((res) => {
        if (res.status) alert(res.message);
      })
      .then((e) => e.message);
  } else return alert("8~16자 영문 대 소문자, 숫자, 특수문자를 사용하세요.");
}

// 비밀번호 유효성 검사 함수
function validationPw(checkPw) {
  const pwPattern = /[a-zA-Z0-9~!@#$%^&*()_+|<>?:{}]{8,16}/;
  if (checkPw === "") return false;
  else if (!pwPattern.test(checkPw)) return false;
  return true;
}
