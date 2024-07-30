import Result "mo:base/Result";
import Map "mo:map/Map";

import Types "Types";
import Controller "Controller";

shared actor class Backend(){

  type User = Types.User;
  type UserRegister = Types.UserRegister;
  type Result<Ok, Err> = Result.Result<Ok, Err>;

  stable var _data = {
    users = {
      var index = 0;
      map_users = Map.new<Principal, User>();
    };
  };

  let _controller = Controller.Controller(_data.users);

  public shared({caller}) func setUser(user: User): async Result<(), Text> {
    _controller.setUser(caller, user);
  };

  public query func getUser(principal: Principal): async ?User {
    _controller.getUser(principal);
  };
  
};
