// Generated by CoffeeScript 1.3.3
(function() {
  var Chromosome, Population, Simulator, global;

  Chromosome = (function() {
    var CHARS, i;

    CHARS = (function() {
      var _i, _results;
      _results = [];
      for (i = _i = 0; _i <= 15; i = ++_i) {
        _results.push(i.toString(16));
      }
      return _results;
    })();

    function Chromosome(code, cost) {
      this.code = code != null ? code : '';
      this.cost = cost != null ? cost : 9999;
      this.mutationCount = 0;
    }

    Chromosome.prototype.getCode = function() {
      return this.code;
    };

    Chromosome.prototype.getCost = function() {
      return this.cost;
    };

    Chromosome.prototype.getMutationCount = function() {
      return this.mutationCount;
    };

    Chromosome.prototype.calculateCost = function(targetCode) {
      var cost, totalCost, _i, _ref;
      totalCost = 0;
      for (i = _i = 0, _ref = this.code.length; 0 <= _ref ? _i < _ref : _i > _ref; i = 0 <= _ref ? ++_i : --_i) {
        totalCost += (cost = this.code.charCodeAt(i) - targetCode.charCodeAt(i), cost * cost);
      }
      return this.cost = totalCost;
    };

    Chromosome.prototype.randomize = function(length) {
      var charIndex, code;
      code = '';
      while (length-- > 0) {
        charIndex = Math.floor(Math.random() * CHARS.length);
        code += CHARS[charIndex];
      }
      return this.code = code;
    };

    Chromosome.prototype.mate = function(chromosome) {
      var combination1, combination2, midIndex, targetCode;
      targetCode = chromosome.getCode();
      midIndex = Math.round(this.code.length / 2) - 1;
      combination1 = this.code.slice(0, midIndex + 1 || 9e9) + targetCode.slice(midIndex + 1);
      combination2 = targetCode.slice(0, midIndex + 1 || 9e9) + this.code.slice(midIndex + 1);
      return [new Chromosome(combination1), new Chromosome(combination2)];
    };

    Chromosome.prototype.mutate = function() {
      var charIndex, offset, offsetChar, offsetIndex, randomChar, randomIndex;
      randomIndex = Math.floor(Math.random() * this.code.length);
      offset = Math.random() <= 0.5 ? -1 : 1;
      randomChar = this.code.charAt(randomIndex);
      charIndex = CHARS.indexOf(randomChar);
      offsetIndex = Math.abs(charIndex + offset) % CHARS.length;
      offsetChar = CHARS[offsetIndex];
      this.code = this.code.slice(0, randomIndex) + offsetChar + this.code.slice(randomIndex + 1);
      return this.mutationCount++;
    };

    return Chromosome;

  })();

  Population = (function() {

    function Population(targetCode, size, factor, mates) {
      var chromosome, i, _i, _ref;
      this.targetCode = targetCode;
      this.size = size;
      this.factor = factor;
      this.mates = mates;
      this.members = [];
      this.generationCount = 0;
      for (i = _i = 0, _ref = this.size; 0 <= _ref ? _i < _ref : _i > _ref; i = 0 <= _ref ? ++_i : --_i) {
        chromosome = new Chromosome();
        chromosome.randomize(this.targetCode.length);
        this.members.push(chromosome);
      }
    }

    Population.prototype.getGenerationCount = function() {
      return this.generationCount;
    };

    Population.prototype.getMembers = function() {
      return this.members;
    };

    Population.prototype.getBestMembers = function() {
      return this.members.slice(0, 3);
    };

    Population.prototype.sort = function() {
      return this.members.sort(function(member1, member2) {
        return member1.getCost() - member2.getCost();
      });
    };

    Population.prototype.getNextGeneration = function() {
      var args, children, i, mates, member, _i, _j, _k, _len, _len1, _ref, _ref1, _ref2;
      _ref = this.members;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        member = _ref[_i];
        member.calculateCost(this.targetCode);
      }
      this.sort();
      args = [this.members.length - this.mates, this.mates];
      mates = this.mates / 2;
      for (i = _j = 0, _ref1 = mates - 1; 0 <= _ref1 ? _j <= _ref1 : _j >= _ref1; i = 0 <= _ref1 ? ++_j : --_j) {
        children = this.members[i].mate(this.members[i + mates]);
        args.push(children[0]);
        args.push(children[1]);
      }
      this.members.splice.apply(this.members, args);
      _ref2 = this.members;
      for (_k = 0, _len1 = _ref2.length; _k < _len1; _k++) {
        member = _ref2[_k];
        if (Math.random() > this.factor) {
          continue;
        }
        member.mutate();
        member.calculateCost(this.targetCode);
        if (member.getCode() === this.targetCode) {
          return true;
        }
      }
      this.generationCount++;
      return false;
    };

    return Population;

  })();

  Simulator = (function() {

    function Simulator(width, height) {
      this.layout = d3.layout.pack().sort(null).size([width, height]).padding(2);
      this.vis = d3.select("#chart").append("svg").attr("width", width).attr("height", height);
    }

    Simulator.prototype.run = function(targetCode, callback, populationSize, mutationFactor, mateFactor) {
      var population, tick, timeout,
        _this = this;
      if (populationSize == null) {
        populationSize = 20;
      }
      if (mutationFactor == null) {
        mutationFactor = 0.5;
      }
      if (mateFactor == null) {
        mateFactor = 2;
      }
      population = new Population(targetCode, populationSize, mutationFactor, mateFactor);
      timeout = null;
      tick = function(result) {
        if (result) {
          return clearTimeout(timeout);
        }
        result = population.getNextGeneration();
        _this.displayPopulation(population);
        if (callback != null) {
          callback.call(_this, population);
        }
        timeout = setTimeout(function() {
          return tick(result);
        }, 0);
        return result;
      };
      return tick(false);
    };

    Simulator.prototype.displayPopulation = function(population) {
      var circles, data, member;
      data = (function() {
        var _i, _len, _ref, _results;
        _ref = population.getMembers();
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          member = _ref[_i];
          _results.push({
            id: member.getCost(),
            color: member.getCode(),
            value: 16,
            alpha: 1.0
          });
        }
        return _results;
      })();
      circles = this.vis.selectAll("circle").data(this.layout.nodes({
        children: data
      }).filter(function(d) {
        return !d.children;
      })).style("fill", function(d) {
        return "#" + d.color;
      }).attr("r", function(d) {
        return d.r;
      }).attr("opacity", function(d) {
        return d.alpha;
      }).attr("transform", function(d) {
        return "translate(" + d.x + "," + d.y + ")";
      });
      circles.enter().append("circle").style("fill", function(d) {
        return "#" + d.color;
      }).attr("r", function(d) {
        return d.r;
      }).attr("opacity", function(d) {
        return d.alpha;
      }).attr("transform", function(d) {
        return "translate(" + d.x + "," + d.y + ")";
      }).transition().duration(150).attr("opacity", 0.3);
      return circles.exit().remove();
    };

    return Simulator;

  })();

  global = typeof exports !== "undefined" && exports !== null ? exports : window;

  global.Chromosome = Chromosome;

  global.Population = Population;

  global.Simulator = Simulator;

}).call(this);
