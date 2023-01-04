class Topsis {
    constructor(elem, topsis, Matrix, m, w, ia) {
        this.el = $(elem);
        this.Topsis = topsis;
        this.Matrix = Matrix;
        this.m = m;
        this.w = w;
        this.ia = ia;
        this.ia_v2 = ['max', 'max', 'max', 'max', 'max'];

        this.product = new Product();
        this.products_container = this.el.find('.products-container .products');
        this.output_html = this.el.find('.output-data');
        this.products = [new Product(1), new Product(2)];

        this.btn_add = null;
        this.btn_delete = null;
        this.btn_count = this.el.find('.products-container .count');
        this.products_price = null;
        this.products_weight = null;

        this.products_list = null;

        this.product_names = null;
        this.product_proteins = null;
        this.product_fats = null;
        this.product_carbohydrates = null;
        this.product_calories = null;
        this.product_price_weights = null;

        this.criterion_weight = this.el.find('.criterion_weight');
        this.criterion_inputs = this.criterion_weight.find('input');
        this.criterion_protein = this.criterion_weight.find('input[name="protein"]');
        this.criterion_fats = this.criterion_weight.find('input[name="fats"]');
        this.criterion_carbohydrates = this.criterion_weight.find('input[name="carbohydrates"]');
        this.criterion_calories = this.criterion_weight.find('input[name="calories"]');
        this.criterion_price_weight = this.criterion_weight.find('input[name="price_weight"]');

        this.events();
    }

    getWeightIndicates(){
        return [
            Number(this.criterion_protein.val()),
            Number(this.criterion_fats.val()),
            Number(this.criterion_carbohydrates.val()),
            Number(this.criterion_calories.val()),
            Number(this.criterion_price_weight.val()),
        ];
    }

    createHash(arr){
        let hash = {};
        for(let i = 0 ; i < arr.length; i += 1) {
            hash[arr[i]] = i;
        }
        return hash;
    }

    getMatrix(){
        let arrays = this.products.map((v1, k1)=>{
            return Object.keys(v1.data).map((v2, k2)=>{
                return v1.getData()[v2];
            });
        });
        arrays.map((v, k)=>{
            return v.splice(0, 2);
        });
        return arrays;
    }

    setData(e){
        let group = $(e.target).parent().parent();
        let index = group.index();
        let data = {
            index:          index,
            name:           $(group).find('input[name="name"]').val(),
            protein:        Number($(group).find('input[name="protein"]').val()),
            fats:           Number($(group).find('input[name="fats"]').val()),
            carbohydrates:  Number($(group).find('input[name="carbohydrates"]').val()),
            calories:       Number($(group).find('input[name="calories"]').val()),
            price_weight:   Number($(group).find('input[name="price_weight"]').val()),
        };
        this.products[index].setData(data);
    }

    getProductsList(){this.products_list = this.el.find('.group');}

    newProduct(){
        this.getProductsList();
        if(this.products_list.length < 10){
            let index = this.products_list.length + 1;
            this.products.push(new Product(index));
            this.appendProduct();
        }
    }
    appendProduct(){
        this.products_container.append(this.products[this.products.length - 1].getProduct());
        this.btn_add.remove();
        if(this.products_list.length < 9){
            this.products_container.append(this.product.getProductBlank());
        }
        let index = this.products_list.length + 1;
        let product = this.el.find(`.group-${index} .delete`);
        this.setEvents(product, 'click', this.deleteProduct);
        this.loadInterface();
    }
    appendProducts(){
        // $(this.products_container).empty();
        this.products.map((v, k)=>{
            this.products_container.append(v.getProduct());
        });
        let product_1 = this.el.find(`.group-${1} .delete`);
        let product_2 = this.el.find(`.group-${2} .delete`);
        this.setEvents(product_1, 'click', this.deleteProduct);
        this.setEvents(product_2, 'click', this.deleteProduct);


        this.products_container.append(this.product.getProductBlank());
    }

    deleteProduct(e){
        let parent = $(e.target).parent();
        console.log(parent);
        let index = parent.index();
        this.getProductsList();
        if(this.products_list.length <= 9){
            this.btn_add.remove();
            this.products_container.append(this.product.getProductBlank());
        }
        parent.remove();
        this.products.splice(index, 1);
        this.loadInterface();
    }

    countPriceAndWeight(e){
        let cur_group = $(e.target).parent().parent();
        let cur_price = cur_group.find('input[name="price"]').val();
        let cur_weight = cur_group.find('input[name="weight"]').val();
        let cur_average = cur_group.find('input[name="price_weight"]');
        if(+cur_price > 0 && +cur_weight > 0){cur_average.val(this.get100grPrice(cur_weight, cur_price))}
    }
    get100grPrice(weight, price){
        return Number(+price * 100 / +weight).toFixed(2);
    }
    checkCriterionSum(e){
        let sum = Number(+this.criterion_protein.val() + +this.criterion_fats.val()
            + +this.criterion_carbohydrates.val() + +this.criterion_calories.val() + +this.criterion_price_weight.val());
        if(sum > 1){
            let preventValue = (1 - (sum - +$(e.target).val())).toFixed(2);
            $(e.target).val(preventValue);
        }
    }

    loadInterface(){
        this.btn_add = this.el.find('.prod-blank');
        this.btn_delete = this.el.find('.delete');
        this.products_price = this.el.find('.group input[name="price"]');
        this.products_weight = this.el.find('.group input[name="weight"]');

        this.product_names = this.el.find('.group input[name="name"]');
        this.product_proteins = this.el.find('.group input[name="protein"]');
        this.product_fats = this.el.find('.group input[name="fats"]');
        this.product_carbohydrates = this.el.find('.group input[name="carbohydrates"]');
        this.product_calories = this.el.find('.group input[name="calories"]');
        this.product_price_weights = this.el.find('.group input[name="weight"]');

        this.reloadEvents();
    }


    onLoad(){
        this.appendProducts();
    }

    setEvents(elem, events, cb){
        elem.off(events, cb.bind(this));
        elem.on(events, cb.bind(this));
    }

    reloadEvents(){
        // this.criterion_inputs.off('change, input', this.checkCriterionSum.bind(this));
        // this.criterion_inputs.on('change, input', this.checkCriterionSum.bind(this));
        this.setEvents(this.criterion_inputs, 'change, input', this.checkCriterionSum);
        // this.btn_count.off('click', this.getWeightIndicates.bind(this));
        // this.btn_count.on('click', this.getWeightIndicates.bind(this));
        // this.setEvents(this.btn_count, 'click', this.getWeightIndicates);
        // this.setEvents(this.btn_count, 'click', this.getMatrix);
        this.setEvents(this.btn_count, 'click', this.countTopsis);

        // this.btn_add.find('.btn').off('click', this.newProduct.bind(this));
        // this.btn_add.find('.btn').on('click', this.newProduct.bind(this));
        this.setEvents(this.btn_add.find('.btn'), 'click', this.newProduct);

        // this.btn_delete.off('click', this.deleteProduct.bind(this));
        // this.btn_delete.on('click', this.deleteProduct.bind(this));
        // this.setEvents(this.btn_delete, 'click', this.deleteProduct);

        // this.products_price.off('change, input', this.countPriceAndWeight.bind(this));
        // this.products_weight.off('change, input', this.countPriceAndWeight.bind(this));
        this.setEvents(this.products_weight, 'change, input', this.countPriceAndWeight);
        // this.products_price.on('change, input', this.countPriceAndWeight.bind(this));
        // this.products_weight.on('change, input', this.countPriceAndWeight.bind(this));
        this.setEvents(this.products_price, 'change, input', this.countPriceAndWeight);

        // this.product_names.off('change, input', this.setData.bind(this));
        // this.product_names.on('change, input', this.setData.bind(this));
        this.setEvents(this.product_names, 'change, input', this.setData);
        // this.product_proteins.off('change, input', this.setData.bind(this));
        // this.product_proteins.on('change, input', this.setData.bind(this));
        this.setEvents(this.product_proteins, 'change, input', this.setData);
        // this.product_fats.off('change, input', this.setData.bind(this));
        // this.product_fats.on('change, input', this.setData.bind(this));
        this.setEvents(this.product_fats, 'change, input', this.setData);
        // this.product_carbohydrates.off('change, input', this.setData.bind(this));
        // this.product_carbohydrates.on('change, input', this.setData.bind(this));
        this.setEvents(this.product_carbohydrates, 'change, input', this.setData);
        // this.product_calories.off('change, input', this.setData.bind(this));
        // this.product_calories.on('change, input', this.setData.bind(this));
        this.setEvents(this.product_calories, 'change, input', this.setData);
        // this.product_price_weights.off('change, input', this.setData.bind(this));
        // this.product_price_weights.on('change, input', this.setData.bind(this));
        this.setEvents(this.product_price_weights, 'change, input', this.setData);
    }

    countTopsis(){
        let matrix = this.getMatrix();
        let hash = this.createHash(matrix);
        matrix = new this.Matrix(matrix);
        let weights = this.getWeightIndicates();

        let key = this.Topsis.getBest(matrix, weights, this.ia_v2);
        let index = hash[key];

        this.display_result(index);
    }

    display_result(idx){
        let product = this.products[idx];
        let index = product.getData().index;
        let name = product.getData().name;
        let order = `<div class="order">Продукт №${index + 1} - ${name}</div>`;
        $(this.output_html).find('.order').remove();
        $(this.output_html).append(order);
    }

    events(){
        this.onLoad();
        this.loadInterface();
    }
}