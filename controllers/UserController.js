class UserController {

    constructor(formIdCreate, formIdUpdate, tableId) {

        this.formEl = document.getElementById(formIdCreate);
        this.formElUpdate = document.getElementById(formIdUpdate);
        this.tableEl = document.getElementById(tableId);

        this.onSubmit();
        this.onEdit();
        this.insertAll();
        this.setFocus();
    }

    onEdit() {

        document.querySelector("#box-user-update .btn-cancel").addEventListener('click', e => {

            this.showPanel("create");
        });

        this.formElUpdate.addEventListener("submit", event => {

            event.preventDefault();

            let btn = this.formElUpdate.querySelector("[type=submit]");

            btn.disabled = true;

            let values = this.getValues(this.formElUpdate);

            if (!values)
                return false;

            let index = this.formElUpdate.dataset.trIndex;

            let tr = this.tableEl.rows[index];

            let userOld = JSON.parse(tr.dataset.user);

            let result = Object.assign({}, userOld, values);

            this.getPhoto(this.formElUpdate).then(

                (content) => {

                    if (!values._photo) {

                        result._photo = userOld._photo;

                    } else {

                        result._photo = content;
                    }

                    let user = new User();

                    user.loadFromJSON(result);

                    user.save();

                    this.getTr(user, tr);

                    this.updateCount();

                    this.formElUpdate.reset();

                    btn.disabled = false;

                    this.showPanel("create");

                    this.setFocus();
                },
                (e) => {

                    console.log(e);

                    btn.disable = true;
                }
            );
        });
    }

    onSubmit() {

        this.formEl.addEventListener("submit", event => {

            event.preventDefault();

            let btn = this.formEl.querySelector("[type=submit]");

            btn.disable = true;

            let values = this.getValues(this.formEl);

            if (!values)
                return false;

            this.getPhoto(this.formEl).then(

                (content) => {

                    values.photo = content;

                    values.save();

                    this.addLine(values);

                    this.formEl.reset();

                    btn.disable = false;

                    this.setFocus();
                },
                (e) => {

                    console.log(e);

                    btn.disable = true;
                }
            );

            // this.getPhoto((content) => {

            //     values.photo = content;

            //     this.addLine(values);
            // });
        });
    }

    getPhoto(formEl) {

        return new Promise((resolve, reject) => {

            let fileReader = new FileReader();

            let elements = [...formEl.elements].filter(item => {

                if (item.name === "photo") {
                    return item;
                }
            })

            let file = elements[0].files[0];

            fileReader.onload = () => {

                resolve(fileReader.result);
            };

            fileReader.onerror = (e) => {

                reject(e);
            };

            if (file) {

                fileReader.readAsDataURL(file);
            } else {

                resolve('dist/img/boxed-bg.jpg');
            }
        });
    }

    // Exemplo de callback
    // getPhoto(callback) {

    //     let fileReader = new FileReader();

    //     let elements = [...this.formEl.elements].filter(item => {

    //         if (item.name === "photo") {
    //             return item;
    //         }
    //     })

    //     let file = elements[0].files[0];

    //     fileReader.onload = () => {

    //         callback(fileReader.result);
    //     };

    //     fileReader.readAsDataURL(file);
    // }

    getValues(formEl) {

        let user = {};

        let isValid = true;

        [...formEl.elements].forEach(field => {

            if (["name", "email", "password"].indexOf(field.name) > -1 && !field.value) {

                field.parentElement.classList.add('has-error');

                isValid = false;
            }

            if (field.name == "gender") {

                if (field.checked) {

                    user[field.name] = field.value;
                }

            } else if (field.name == "admin") {

                user[field.name] = field.checked;

            } else {

                user[field.name] = field.value;
            }
        });

        if (!isValid)
            return false;

        return new User(
            user.name,
            user.gender,
            user.birth,
            user.country,
            user.email,
            user.password,
            user.photo,
            user.admin);
    }

    insertAll() {

        let users = User.getUsersStorage();

        users.forEach(dataUser => {

            let user = new User();

            user.loadFromJSON(dataUser);

            this.addLine(user);
        });

        this.setFocus();
    }

    setFocus() {

        //let textbox = this.formEl.querySelector("#exampleInputName");

        //textbox.focus();
        //textbox.scrollIntoView();
    }

    addLine(dataUser) {

        let tr = this.getTr(dataUser);

        this.tableEl.appendChild(tr);

        this.updateCount();
    }

    getTr(dataUser, tr = null) {

        if (tr === null) {

            tr = document.createElement('tr');
        }

        tr.dataset.user = JSON.stringify(dataUser);

        tr.innerHTML = `
            <td><img src=${dataUser.photo} alt="User Image" class="img-circle img-sm"></td>
            <td>${dataUser.name}</td>
            <td>${dataUser.email}</td>
            <td>${dataUser.admin ? "Sim" : "Não"}</td>
            <td>${Utils.dateFormat(dataUser.register)}</td>
            <td>
            <button type="button" class="btn btn-edit btn-primary btn-xs btn-flat">Editar</button>
            <button type="button" class="btn btn-delete btn-danger btn-xs btn-flat">Excluir</button>
            </td>`;

        this.addEventsTr(tr);

        return tr;
    }

    addEventsTr(tr) {

        let btn = tr.querySelector(".btn-edit");

        btn.addEventListener('click', () => {

            let json = JSON.parse(tr.dataset.user);

            this.formElUpdate.dataset.trIndex = tr.sectionRowIndex;

            for (const name in json) {

                let field = this.formElUpdate.querySelector("[name=" + name.replace("_", "") + "]");

                if (field) {

                    if (field.type == 'file')
                        continue;

                    switch (field.type) {
                        case 'file':
                            continue;
                        case 'radio':
                            field = this.formElUpdate.querySelector("[name=" + name.replace("_", "") + "][value=" + json[name] + "]");
                            field.checked = true;
                            break;
                        case 'checkbox':
                            field.checked = json[name];
                            break;
                        default:
                            field.value = json[name];
                            break;
                    }
                }
            }

            this.formElUpdate.querySelector(".photo").src = json._photo;

            this.showPanel("update");
        });

        tr.querySelector(".btn-delete").addEventListener('click', e => {

            if (confirm("Confirma a EXCLUSÃO do registro?")) {

                let user = new User();

                user.loadFromJSON(JSON.parse(tr.dataset.user));

                user.remove();

                tr.remove();

                this.updateCount();
            }
        });
    }

    updateCount() {

        let users = 0;
        let usersAdmin = 0;

        [...this.tableEl.children].forEach((tr) => {

            users++;

            let user = JSON.parse(tr.dataset.user);

            if (user._admin)
                usersAdmin++;

        });

        document.getElementById("number-users").innerHTML = users;
        document.getElementById("number-users-admin").innerHTML = usersAdmin;
    }

    showPanel(type) {

        document.querySelector("#box-user-create").style.display = type == "create" ?
            "block" : "none";
        document.querySelector("#box-user-update").style.display = type == "update" ?
            "block" : "none";
    }
}