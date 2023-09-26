namespace wb;

using {cuid} from '@sap/cds/common';

entity Products : cuid {
    @mandatory
    @assert.notNull: false
    Product     : String(100);
    Description : String(200);

    @assert.range  : [
        0,
        5
    ]
    Ranking     : Integer default 0;
    Category    : Association to Categories;
}

entity Categories : cuid {

    Category    : String not null;
    Description : String not null;
    ToProducts  : Composition of many Products
                      on ToProducts.Category = $self
}
