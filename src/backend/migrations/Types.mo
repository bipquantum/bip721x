import Migration010 "./00-01-00-initial/Types";
import Migration020 "./00-02-00-chat_name/Types";
import Migration030 "./00-03-00-user_image/Types";
import Migration040 "./00-04-00-chatgpt_key/Types";
import Migration050 "./00-05-00-notifications/Types";
import Migration060 "./00-06-00-ckbtc_rate/Types";

module {
  // do not forget to change current migration when you add a new one
  // you should use this field to import types from you current migration anywhere in your project
  // instead of importing it from migration folder itself
  public let Current = Migration060;
  
  public type Args = Current.Args;

  public type State = {
    #v0_1_0: Migration010.State;
    #v0_2_0: Migration020.State;
    #v0_3_0: Migration030.State;
    #v0_4_0: Migration040.State;
    #v0_5_0: Migration050.State;
    #v0_6_0: Migration060.State;
    // do not forget to add your new migration data types here
  };
};