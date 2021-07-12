class UserController {

    constructor(formId, tableId) {

        this.formEl = document.getElementById(formId);
        this.tableEl = document.getElementById(tableId);

        this.onSubmit();
        this.onEdit();
    }

    onEdit() {

        document.querySelector("#box-user-update .btn-cancel").addEventListener('click', e => {

            this.showPanel("create");
        })

    }

    onSubmit() {

        this.formEl.addEventListener("submit", event => {

            event.preventDefault();

            let btn = this.formEl.querySelector("[type=submit]");

            btn.disable = true;

            let values = this.getValues();

            if (!values)
                return false;

            this.getPhoto().then(

                (content) => {

                    values.photo = content;

                    this.addLine(values);

                    this.formEl.reset();

                    btn.disable = false;
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

    getPhoto() {

        return new Promise((resolve, reject) => {

            let fileReader = new FileReader();

            let elements = [...this.formEl.elements].filter(item => {

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

    getValues() {

        let user = {};

        let isValid = true;

        [...this.formEl.elements].forEach(field => {

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

    addLine(dataUser) {

        let tr = document.createElement('tr');

        tr.dataset.user = JSON.stringify(dataUser);

        tr.innerHTML += `
            <td><img src=${dataUser.photo} alt="User Image" class="img-circle img-sm"></td>
            <td>${dataUser.name}</td>
            <td>${dataUser.email}</td>
            <td>${dataUser.admin ? "Sim" : "Não"}</td>
            <td>${Utils.dateFormat(dataUser.register)}</td>
            <td>
            <button type="button" class="btn btn-edit btn-primary btn-xs btn-flat">Editar</button>
            <button type="button" class="btn btn-delete btn-danger btn-xs btn-flat">Excluir</button>
            </td>`;

        tr.querySelector(".btn-edit").addEventListener('click', e => {

            let json = JSON.parse(tr.dataset.user);

            let form = document.querySelector("#form-user-update");

            for (const name in json) {

                let field = form.querySelector("[name=" + name.replace("_", "") + "]");

                if (field) {

                    if (field.type == 'file')
                        continue;

                    field.value = json[name];
                }
            }

            this.showPanel("update");
        });

        this.tableEl.appendChild(tr);

        this.updateCount();
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