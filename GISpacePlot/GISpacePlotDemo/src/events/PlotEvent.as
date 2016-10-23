package events
{
	import flash.events.Event;
	
	public class PlotEvent extends Event
	{
		public static const NEW_PLOT:String = "newPlot";
		public static const APPLY_SYMBOL:String = "applySymbol";
		
		public var data:Object;
		
		public function PlotEvent(type:String, data:Object=null)
		{
			super(type, true, false);
			this.data = data;
		}
	}
}