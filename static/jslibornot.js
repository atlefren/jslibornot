(function () {
    "use strict";

    //+ Jonas Raoni Soares Silva
    //@ http://jsfromhell.com/array/shuffle [v1.0]
    function shuffle(o) { //v1.0
        for(var j, x, i = o.length; i; j = Math.floor(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
        return o;
    }

    var Question = Backbone.Model.extend({
        defaults: {
            answered: false,
            correct: false
        },

        answer: function (isLib) {
            var correct = (isLib === this.get('isLib'));
            this.set({
                correct: correct,
                answered: true
            });
            this.trigger('answered');
        }
    });

    var Questions = Backbone.Collection.extend({

        model: Question,

        getNext: function () {
            return this.findWhere({answered: false});
        },

        getStats: function () {
            var answers = this.map(function (question) {
                return {
                    name: question.get('name'),
                    correct: question.get('correct'),
                    isLib: question.get('isLib'),
                    link: question.get("link")
                }
            });

            return {
                correct: this.where({correct: true}).length,
                num: this.length,
                answers: answers
            }
        }
    });

    var QuestionView = Backbone.View.extend({

        template: $('#question_template').html(),

        events: {
            'click #yes': 'yes',
            'click #no': 'no'
        },

        initialize: function () {
            _.bindAll(this, 'yes', 'no');
        },

        render: function () {
            this.$el.html(_.template(this.template, this.model.toJSON()));
            return this;
        },

        yes: function () {
            this.model.answer(true);
        },

        no: function () {
            this.model.answer(false);
        }
    });

    var QuizView = Backbone.View.extend({

        className: 'col-m-d12',

        template: $('#quiz_div_template').html(),

        initialize: function () {
            this.collection.on('answered', this.render, this);
        },

        render: function () {

            var model = this.collection.getNext();
            if (model) {
                this.$el.html(new QuestionView({model: model}).render().$el);
            } else {
                var stats = this.collection.getStats();
                this.$el.html(_.template(this.template, stats));
            }
            return this;
        }
    });

    function startQuiz() {
        var libs = [
            {'name': "Bacon", 'isLib': true, 'link': 'http://baconjs.github.io/'},
            {'name': "Tiger", 'isLib': true, 'link': 'https://github.com/doublerebel/tiger'},
            {'name': "Ham", 'isLib': true, 'link': 'https://github.com/jameskeane/ham-script'},
            {'name': "Broccoli", 'isLib': true, 'link': 'https://github.com/joliss/broccoli'},
            {'name': "Smårettskinke", 'isLib': false},
            {'name': "Pasta", 'isLib': true, 'link': 'https://github.com/ympbyc/Pasta'},
            {'name': "Prawn", 'isLib': true, 'link': 'https://github.com/yob/prawn-js'},
            {'name': "Diabetes", 'isLib': false},
            {'name': "Sushi", 'isLib': true, 'link': 'https://github.com/inf0rmer/Sushi-JS'},
            {'name': "Shakespeare", 'isLib': true, 'link': 'http://hackage.haskell.org/package/shakespeare-js-1.0.2'}
        ];

        var startDiv = $('#start_div').hide();
        var quizView = new QuizView({
            collection: new Questions(shuffle(libs))
        }).render();
        startDiv.after(quizView.$el);
    }
    $('#start').click(startQuiz);
}());
