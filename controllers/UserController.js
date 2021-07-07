class UserController {

    constructor(formId, tableId) {

        this.formEl = document.getElementById(formId);
        this.tableEl = document.getElementById(tableId);

        this.onSubmit();
    }

    onSubmit() {

        this.formEl.addEventListener("submit", event => {

            event.preventDefault();

            let btn = this.formEl.querySelector("[type=submit]");

            btn.disable = true;

            let values = this.getValues();

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

        [...this.formEl.elements].forEach(field => {

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

        this.tableEl.innerHTML += `
        <tr>
            <td><img src=${dataUser.photo} alt="User Image" class="img-circle img-sm"></td>
            <td>${dataUser.name}</td>
            <td>${dataUser.email}</td>
            <td>${dataUser.admin ? "Sim" : "Não"}</td>
            <td>${dataUser.birth}</td>
            <td>
            <button type="button" class="btn btn-primary btn-xs btn-flat">Editar</button>
            <button type="button" class="btn btn-danger btn-xs btn-flat">Excluir</button>
            </td>
        </tr>`;
    }
}